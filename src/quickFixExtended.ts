import * as vscode from 'vscode';

/**
 * 拡張クイックフィックス機能
 * - インデント エラーの自動修正
 * - 未閉じブロック検出
 * - 括弧の対応エラー修正
 * - 一般的な構文エラー提案
 */

interface QuickFixAction {
    title: string;
    kind: vscode.CodeActionKind;
    edit: vscode.WorkspaceEdit;
    diagnostics?: vscode.Diagnostic[];
}

export class QuickFixProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix,
        vscode.CodeActionKind.Refactor
    ];

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): QuickFixAction[] {
        const actions: QuickFixAction[] = [];
        const text = document.getText();
        const line = document.lineAt(range.start.line);
        const lineText = line.text;

        // 1. インデント自動修正
        const indentFix = this.tryFixIndentation(document, line, range);
        if (indentFix) actions.push(indentFix);

        // 2. 未閉じ括弧修正
        const bracketFix = this.tryFixUnclosedBrackets(document, line, range);
        if (bracketFix) actions.push(bracketFix);

        // 3. 未閉じブロック（終わり）修正
        const blockFix = this.tryFixUnclosedBlock(document, range);
        if (blockFix) actions.push(blockFix);

        // 4. 一般的なキーワード修正
        const keywordFix = this.tryFixCommonKeywords(document, line, range);
        if (keywordFix) actions.push(...keywordFix);

        // 5. スペーシング修正
        const spacingFix = this.tryFixSpacing(document, line, range);
        if (spacingFix) actions.push(...spacingFix);

        return actions;
    }

    /**
     * インデント自動修正
     */
    private tryFixIndentation(
        document: vscode.TextDocument,
        line: vscode.TextLine,
        range: vscode.Range
    ): QuickFixAction | null {
        const lineText = line.text;
        const match = lineText.match(/^(\s*)/);
        const currentIndent = match ? match[1].length : 0;

        // 前の行のインデントレベルを取得
        if (line.lineNumber === 0) return null;

        const prevLine = document.lineAt(line.lineNumber - 1);
        const prevText = prevLine.text;
        const prevMatch = prevText.match(/^(\s*)/);
        const prevIndent = prevMatch ? prevMatch[1].length : 0;

        // ブロック開始キーワード後は +4
        const shouldIncreaseIndent = /(:|\s|関数|もし|型|試行|繰り返す|条件)$/.test(prevText.trim());
        const expectedIndent = shouldIncreaseIndent ? prevIndent + 4 : prevIndent;

        if (currentIndent !== expectedIndent) {
            const edit = new vscode.WorkspaceEdit();
            const indentStr = ' '.repeat(expectedIndent);
            const trimmed = lineText.trimStart();

            edit.replace(
                document.uri,
                new vscode.Range(
                    line.lineNumber,
                    0,
                    line.lineNumber,
                    currentIndent
                ),
                indentStr
            );

            return {
                title: `インデント自動修正 (${expectedIndent}スペース)`,
                kind: vscode.CodeActionKind.QuickFix,
                edit,
                diagnostics: []
            };
        }

        return null;
    }

    /**
     * 未閉じ括弧修正
     */
    private tryFixUnclosedBrackets(
        document: vscode.TextDocument,
        line: vscode.TextLine,
        range: vscode.Range
    ): QuickFixAction | null {
        const lineText = line.text;
        const openParens = (lineText.match(/\(/g) || []).length;
        const closeParens = (lineText.match(/\)/g) || []).length;
        const openBrackets = (lineText.match(/\[/g) || []).length;
        const closeBrackets = (lineText.match(/\]/g) || []).length;
        const openBraces = (lineText.match(/\{/g) || []).length;
        const closeBraces = (lineText.match(/\}/g) || []).length;

        let missingClose = '';
        if (openParens > closeParens) missingClose += ')'.repeat(openParens - closeParens);
        if (openBrackets > closeBrackets) missingClose += ']'.repeat(openBrackets - closeBrackets);
        if (openBraces > closeBraces) missingClose += '}'.repeat(openBraces - closeBraces);

        if (missingClose) {
            const edit = new vscode.WorkspaceEdit();
            const endPos = line.range.end;

            edit.insert(document.uri, endPos, missingClose);

            return {
                title: `括弧を閉じる: ${missingClose}`,
                kind: vscode.CodeActionKind.QuickFix,
                edit,
                diagnostics: []
            };
        }

        return null;
    }

    /**
     * 未閉じブロック（終わり）修正
     */
    private tryFixUnclosedBlock(
        document: vscode.TextDocument,
        range: vscode.Range
    ): QuickFixAction | null {
        const text = document.getText();
        const lines = text.split('\n');

        // ブロック開始キーワードのカウント
        let blockStarts = 0;
        let blockEnds = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const blockStartMatch = line.match(/(関数|型|もし|試行|繰り返す|条件|一方)\s*.*:?$/);
            const blockEndMatch = line.match(/^\s*終わり\s*$/);

            if (blockStartMatch) blockStarts++;
            if (blockEndMatch) blockEnds++;
        }

        if (blockStarts > blockEnds) {
            const edit = new vscode.WorkspaceEdit();
            const lastLine = lines.length - 1;
            const endPos = new vscode.Position(lastLine, 0);
            const missingEnds = '\n終わり'.repeat(blockStarts - blockEnds);

            edit.insert(document.uri, endPos, missingEnds);

            return {
                title: `ブロックを閉じる: 「終わり」を ${blockStarts - blockEnds} 個追加`,
                kind: vscode.CodeActionKind.QuickFix,
                edit,
                diagnostics: []
            };
        }

        return null;
    }

    /**
     * 一般的なキーワード修正
     */
    private tryFixCommonKeywords(
        document: vscode.TextDocument,
        line: vscode.TextLine,
        range: vscode.Range
    ): QuickFixAction[] {
        const actions: QuickFixAction[] = [];
        const lineText = line.text;

        // よくあるタイプミスの修正案
        const typos: Record<string, string> = {
            '関数を': '関数',
            '型を': '型',
            'もしも': 'もし',
            'もし程': 'もし',
            '終了': '終わり',
            '終る': '終わり',
            '戻します': '戻す',
            'かえす': '戻す',
            'kansu': '関数',
            'kansuu': '関数',
            'hensuu': '変数',
            'teisuu': '定数',
            'moshi': 'もし',
            'modosu': '戻す',
            'owari': '終わり',
            'torikomu': '取り込む',
            'hyouji': '表示',
            'hyoji': '表示',
            'function': '関数',
            'return': '戻す'
        };

        for (const [typo, correct] of Object.entries(typos)) {
            if (lineText.includes(typo)) {
                const edit = new vscode.WorkspaceEdit();
                const index = lineText.indexOf(typo);
                const range = new vscode.Range(
                    line.lineNumber,
                    index,
                    line.lineNumber,
                    index + typo.length
                );

                edit.replace(document.uri, range, correct);

                actions.push({
                    title: `「${typo}」を「${correct}」に修正`,
                    kind: vscode.CodeActionKind.QuickFix,
                    edit,
                    diagnostics: []
                });
            }
        }

        return actions;
    }

    /**
     * スペーシング修正
     */
    private tryFixSpacing(
        document: vscode.TextDocument,
        line: vscode.TextLine,
        range: vscode.Range
    ): QuickFixAction[] {
        const actions: QuickFixAction[] = [];
        const lineText = line.text;

        // 演算子周りのスペーシング
        const operators = ['=', '+', '-', '*', '/', '==', '!=', '<=', '>='];

        for (const op of operators) {
            // スペースなしパターンをチェック
            const noSpacePattern = new RegExp(`\\w${op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w`);
            if (noSpacePattern.test(lineText)) {
                const edit = new vscode.WorkspaceEdit();
                const newText = lineText.replace(noSpacePattern, m => {
                    return m.charAt(0) + ' ' + op + ' ' + m.charAt(m.length - 1);
                });

                edit.replace(
                    document.uri,
                    line.range,
                    newText
                );

                actions.push({
                    title: `演算子「${op}」の前後にスペースを追加`,
                    kind: vscode.CodeActionKind.QuickFix,
                    edit,
                    diagnostics: []
                });
                break; // 最初のマッチのみ
            }
        }

        return actions;
    }
}

/**
 * 拡張クイックフィックス機能を登録
 */
export function registerQuickFixExtended(context: vscode.ExtensionContext) {
    const provider = new QuickFixProvider();

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            'hajimu',
            provider,
            {
                providedCodeActionKinds: QuickFixProvider.providedCodeActionKinds
            }
        )
    );
}
