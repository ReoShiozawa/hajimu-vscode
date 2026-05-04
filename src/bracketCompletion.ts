import * as vscode from 'vscode';

/**
 * 括弧・括弧対応補完
 * - 括弧の自動閉じ
 * - 対応括弧のハイライト
 * - 括弧間のジャンプ
 */

export class BracketCompletionProvider implements vscode.OnTypeFormattingEditProvider {
    private bracketPairs: Record<string, string> = {
        '(': ')',
        '[': ']',
        '{': '}'
    };

    private closingBrackets = [')', ']', '}'];

    provideOnTypeFormattingEdits(
        document: vscode.TextDocument,
        position: vscode.Position,
        ch: string,
        options: vscode.FormattingOptions
    ): vscode.TextEdit[] {
        // 開き括弧の場合、閉じ括弧を自動挿入
        if (ch in this.bracketPairs) {
            return this.handleOpeningBracket(document, position, ch);
        }

        // 閉じ括弧の場合、既存の閉じ括弧をスキップ
        if (this.closingBrackets.includes(ch)) {
            return this.handleClosingBracket(document, position, ch);
        }

        return [];
    }

    /**
     * 開き括弧を入力された時の処理
     */
    private handleOpeningBracket(
        document: vscode.TextDocument,
        position: vscode.Position,
        openBracket: string
    ): vscode.TextEdit[] {
        const closeBracket = this.bracketPairs[openBracket];
        const line = document.lineAt(position.line);
        const lineText = line.text;
        const charAfter = lineText.charAt(position.character);

        // 次の文字が既に閉じ括弧の場合は、自動挿入しない
        if (charAfter === closeBracket) {
            return [];
        }

        // 自動閉じ括弧を挿入
        const edits: vscode.TextEdit[] = [];
        edits.push(
            vscode.TextEdit.insert(position, closeBracket)
        );

        return edits;
    }

    /**
     * 閉じ括弧を入力された時の処理
     */
    private handleClosingBracket(
        document: vscode.TextDocument,
        position: vscode.Position,
        closeBracket: string
    ): vscode.TextEdit[] {
        const line = document.lineAt(position.line);
        const lineText = line.text;
        const charAfter = lineText.charAt(position.character);

        // 次の文字が既に閉じ括弧の場合、入力を削除してスキップ
        if (charAfter === closeBracket) {
            const deleteEdit = vscode.TextEdit.delete(
                new vscode.Range(position, new vscode.Position(position.line, position.character + 1))
            );
            return [deleteEdit];
        }

        return [];
    }
}

/**
 * 括弧ハイライト装飾
 */
export class BracketHighlighter {
    private decorationType: vscode.TextEditorDecorationType;

    constructor() {
        this.decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editorBracketMatch.background'),
            border: '1px solid ' + new vscode.ThemeColor('editorBracketMatch.border'),
            borderRadius: '2px'
        });
    }

    /**
     * エディタの括弧をハイライト
     */
    highlightBrackets(editor: vscode.TextEditor) {
        const document = editor.document;
        const text = document.getText();
        const ranges: vscode.Range[] = [];

        // 対応する括弧のペアをハイライト
        const bracketStack: Array<{ char: string; pos: vscode.Position }> = [];
        const bracketPairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
        const reversePairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const pos = document.positionAt(i);

            if (char in bracketPairs) {
                bracketStack.push({ char, pos });
            } else if (char in reversePairs) {
                const opening = bracketStack.pop();
                if (opening && reversePairs[char] === opening.char) {
                    ranges.push(new vscode.Range(opening.pos, new vscode.Position(opening.pos.line, opening.pos.character + 1)));
                    ranges.push(new vscode.Range(pos, new vscode.Position(pos.line, pos.character + 1)));
                }
            }
        }

        editor.setDecorations(this.decorationType, ranges);
    }

    dispose() {
        this.decorationType.dispose();
    }
}

/**
 * 括弧補完機能を登録
 */
export function registerBracketCompletion(context: vscode.ExtensionContext) {
    const provider = new BracketCompletionProvider();
    const highlighter = new BracketHighlighter();

    // OnTypeFormatting プロバイダ登録
    context.subscriptions.push(
        vscode.languages.registerOnTypeFormattingEditProvider(
            'hajimu',
            provider,
            '(', '[', '{', ')', ']', '}'
        )
    );

    // 括弧ハイライト
    const updateHighlight = (editor: vscode.TextEditor | undefined) => {
        if (editor && editor.document.languageId === 'hajimu') {
            highlighter.highlightBrackets(editor);
        }
    };

    // エディタ選択時とテキスト変更時にハイライト更新
    vscode.window.onDidChangeActiveTextEditor(updateHighlight, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(
        event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === event.document) {
                updateHighlight(editor);
            }
        },
        null,
        context.subscriptions
    );

    // 初期化
    updateHighlight(vscode.window.activeTextEditor);

    // 括弧間のジャンプコマンド
    const jumpToMatchingBracketCommand = vscode.commands.registerCommand(
        'hajimu.jumpToMatchingBracket',
        () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const document = editor.document;
            const position = editor.selection.active;
            const char = document.getText(new vscode.Range(position, new vscode.Position(position.line, position.character + 1)));
            const text = document.getText();
            const offset = document.offsetAt(position);

            const bracketPairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', ')': '(', ']': '[', '}': '{' };
            if (!(char in bracketPairs)) return;

            // 対応する括弧を検索
            let count = 1;
            let matchOffset = offset;
            const isOpen = char in { '(': 1, '[': 1, '{': 1 };

            if (isOpen) {
                // 開き括弧から閉じ括弧を検索
                for (let i = offset + 1; i < text.length; i++) {
                    const c = text[i];
                    if (c === char) count++;
                    if (c === bracketPairs[char]) {
                        count--;
                        if (count === 0) {
                            matchOffset = i;
                            break;
                        }
                    }
                }
            } else {
                // 閉じ括弧から開き括弧を検索
                for (let i = offset - 1; i >= 0; i--) {
                    const c = text[i];
                    if (c === char) count++;
                    if (c === bracketPairs[char]) {
                        count--;
                        if (count === 0) {
                            matchOffset = i;
                            break;
                        }
                    }
                }
            }

            const matchPos = document.positionAt(matchOffset);
            editor.selection = new vscode.Selection(matchPos, matchPos);
            editor.revealRange(new vscode.Range(matchPos, matchPos));
        }
    );

    context.subscriptions.push(jumpToMatchingBracketCommand);
    context.subscriptions.push({ dispose: () => highlighter.dispose() });
}
