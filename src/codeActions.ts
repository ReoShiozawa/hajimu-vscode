/**
 * コードアクション — クイックフィックス＆リファクタリング
 */
import * as vscode from 'vscode';

export function registerCodeActions(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('hajimu', new HajimuCodeActionProvider(), {
            providedCodeActionKinds: [
                vscode.CodeActionKind.QuickFix,
                vscode.CodeActionKind.Refactor,
            ]
        })
    );
}

class HajimuCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext
    ): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];

        for (const diag of context.diagnostics) {
            const explainAction = new vscode.CodeAction(
                'このエラーを説明',
                vscode.CodeActionKind.QuickFix
            );
            explainAction.command = {
                command: 'hajimu.explainDiagnosticsAtCursor',
                title: 'このエラーを説明'
            };
            explainAction.diagnostics = [diag];
            actions.push(explainAction);

            // 「終わり」がない → 追加する
            if (diag.message.includes('対応する「終わり」がありません')) {
                const fix = new vscode.CodeAction(
                    '「終わり」を追加',
                    vscode.CodeActionKind.QuickFix
                );
                // ブロック開始行を見つけて、適切な位置に「終わり」を挿入
                const blockLine = diag.range.start.line;
                const indent = document.lineAt(blockLine).text.match(/^(\s*)/)?.[1] || '';
                const insertLine = findInsertionPoint(document, blockLine);
                fix.edit = new vscode.WorkspaceEdit();
                fix.edit.insert(document.uri, new vscode.Position(insertLine + 1, 0), `${indent}終わり\n`);
                fix.diagnostics = [diag];
                fix.isPreferred = true;
                actions.push(fix);
            }

            // 「なら」がない →「なら」を追加
            if (diag.message.includes('「なら」がありません')) {
                const fix = new vscode.CodeAction(
                    '「なら」を追加',
                    vscode.CodeActionKind.QuickFix
                );
                const line = document.lineAt(diag.range.start.line);
                const trimmed = line.text.replace(/\/\/.*$/, '').trimEnd();
                fix.edit = new vscode.WorkspaceEdit();
                fix.edit.replace(document.uri,
                    new vscode.Range(diag.range.start.line, 0, diag.range.start.line, line.text.length),
                    trimmed + ' なら'
                );
                fix.diagnostics = [diag];
                fix.isPreferred = true;
                actions.push(fix);
            }

            // コロン「:」がない → 追加
            if (diag.message.includes('コロン「:」がありません')) {
                const fix = new vscode.CodeAction(
                    '「:」を追加',
                    vscode.CodeActionKind.QuickFix
                );
                const line = document.lineAt(diag.range.start.line);
                const trimmedEnd = line.text.trimEnd();
                fix.edit = new vscode.WorkspaceEdit();
                fix.edit.replace(document.uri,
                    new vscode.Range(diag.range.start.line, 0, diag.range.start.line, line.text.length),
                    trimmedEnd + ':'
                );
                fix.diagnostics = [diag];
                fix.isPreferred = true;
                actions.push(fix);
            }

            // 代入がない → 「= 無」を追加
            if (diag.message.includes('代入「=」がありません')) {
                const fix = new vscode.CodeAction(
                    '「= 無」を追加',
                    vscode.CodeActionKind.QuickFix
                );
                const line = document.lineAt(diag.range.start.line);
                fix.edit = new vscode.WorkspaceEdit();
                fix.edit.replace(document.uri,
                    new vscode.Range(diag.range.start.line, 0, diag.range.start.line, line.text.length),
                    line.text.trimEnd() + ' = 無'
                );
                fix.diagnostics = [diag];
                fix.isPreferred = true;
                actions.push(fix);
            }

            // 文字列が閉じられていない → 「"」を追加
            if (diag.message.includes('" が不足しています')) {
                const fix = new vscode.CodeAction(
                    '閉じ「"」を追加',
                    vscode.CodeActionKind.QuickFix
                );
                const line = document.lineAt(diag.range.start.line);
                fix.edit = new vscode.WorkspaceEdit();
                fix.edit.replace(document.uri,
                    new vscode.Range(diag.range.start.line, 0, diag.range.start.line, line.text.length),
                    line.text.trimEnd() + '"'
                );
                fix.diagnostics = [diag];
                actions.push(fix);
            }

            // 「の間」がない → 追加
            if (diag.message.includes('「の間」がありません')) {
                const fix = new vscode.CodeAction(
                    '「の間」を追加',
                    vscode.CodeActionKind.QuickFix
                );
                const line = document.lineAt(diag.range.start.line);
                fix.edit = new vscode.WorkspaceEdit();
                fix.edit.replace(document.uri,
                    new vscode.Range(diag.range.start.line, 0, diag.range.start.line, line.text.length),
                    line.text.trimEnd() + ' の間'
                );
                fix.diagnostics = [diag];
                fix.isPreferred = true;
                actions.push(fix);
            }

            // 「返す」→「戻す」へ統一
            if (diag.message.includes('「返す」は「戻す」の別名です')) {
                const fix = new vscode.CodeAction(
                    '「戻す」に統一',
                    vscode.CodeActionKind.QuickFix
                );
                fix.edit = new vscode.WorkspaceEdit();
                fix.edit.replace(document.uri, diag.range, '戻す');
                fix.diagnostics = [diag];
                fix.isPreferred = true;
                actions.push(fix);
            }

            // 関数呼び出しの裸引数 → 名前(...)
            if (diag.message.includes('関数呼び出しは「') && diag.message.includes('(...)」の形で書きます')) {
                const line = document.lineAt(diag.range.start.line);
                const match = line.text.match(/^(\s*)([\p{L}_][\p{L}\p{N}_]*)\s+(.+)$/u);
                if (match && !match[3].trimStart().startsWith('(')) {
                    const fix = new vscode.CodeAction(
                        `「${match[2]}(...)」に修正`,
                        vscode.CodeActionKind.QuickFix
                    );
                    fix.edit = new vscode.WorkspaceEdit();
                    fix.edit.replace(
                        document.uri,
                        new vscode.Range(line.lineNumber, 0, line.lineNumber, line.text.length),
                        `${match[1]}${match[2]}(${match[3].trim()})`
                    );
                    fix.diagnostics = [diag];
                    fix.isPreferred = true;
                    actions.push(fix);
                }
            }

            // 閉じ括弧不足 → 行末へ追加
            if (diag.message.includes('閉じ括弧「)」がありません')) {
                const fix = new vscode.CodeAction(
                    '閉じ括弧「)」を追加',
                    vscode.CodeActionKind.QuickFix
                );
                const line = document.lineAt(diag.range.start.line);
                fix.edit = new vscode.WorkspaceEdit();
                fix.edit.insert(document.uri, line.range.end, ')');
                fix.diagnostics = [diag];
                actions.push(fix);
            }

            if (diag.message.includes('閉じ括弧「]」がありません')) {
                const fix = new vscode.CodeAction(
                    '閉じ括弧「]」を追加',
                    vscode.CodeActionKind.QuickFix
                );
                const line = document.lineAt(diag.range.start.line);
                fix.edit = new vscode.WorkspaceEdit();
                fix.edit.insert(document.uri, line.range.end, ']');
                fix.diagnostics = [diag];
                actions.push(fix);
            }

            // プラグイン import 候補
            if (diag.message.includes('import候補:')) {
                const candidate = extractImportCandidate(diag.message);
                if (candidate) {
                    const fix = new vscode.CodeAction(
                        `「${candidate.statement}」を追加`,
                        vscode.CodeActionKind.QuickFix
                    );
                    const insertLine = findImportInsertionLine(document);
                    fix.edit = new vscode.WorkspaceEdit();
                    fix.edit.insert(document.uri, new vscode.Position(insertLine, 0), `${candidate.statement}\n`);
                    fix.diagnostics = [diag];
                    fix.isPreferred = true;
                    actions.push(fix);
                }
            }

            // 未定義識別子 → 近い候補に置き換え
            if (diag.message.includes('未定義の可能性があります') && diag.message.includes('もしかして:')) {
                const unknownName = document.getText(diag.range);
                const suggestions = extractUndefinedIdentifierSuggestions(diag.message);
                suggestions.forEach((suggestion, index) => {
                    if (suggestion === unknownName) {
                        return;
                    }

                    const fix = new vscode.CodeAction(
                        `「${unknownName}」を「${suggestion}」に置き換え`,
                        vscode.CodeActionKind.QuickFix
                    );
                    fix.edit = new vscode.WorkspaceEdit();
                    fix.edit.replace(document.uri, diag.range, suggestion);
                    fix.diagnostics = [diag];
                    fix.isPreferred = index === 0;
                    actions.push(fix);
                });
            }
        }

        // 選択範囲をベースにしたリファクタリング
        if (!range.isEmpty) {
            // 選択範囲を関数に抽出
            const extractAction = new vscode.CodeAction(
                '選択範囲を関数に抽出',
                vscode.CodeActionKind.Refactor
            );
            extractAction.command = {
                command: 'hajimu.extractFunction',
                title: '関数に抽出',
                arguments: [document, range]
            };
            actions.push(extractAction);
        }

        return actions;
    }
}

function extractUndefinedIdentifierSuggestions(message: string): string[] {
    const suggestionText = message.split('もしかして:')[1];
    if (!suggestionText) {
        return [];
    }

    const suggestions: string[] = [];
    const seen = new Set<string>();
    const regex = /「([^」]+)」/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(suggestionText)) !== null) {
        if (!seen.has(match[1])) {
            seen.add(match[1]);
            suggestions.push(match[1]);
        }
    }
    return suggestions;
}

function extractImportCandidate(message: string): { statement: string } | null {
    const match = message.match(/import候補:\s*(取り込む\s+"[^"]+"\s+として\s+[\p{L}\p{N}_]+)/u);
    return match ? { statement: match[1] } : null;
}

function findImportInsertionLine(document: vscode.TextDocument): number {
    let insertLine = 0;
    while (insertLine < document.lineCount) {
        const trimmed = document.lineAt(insertLine).text.trim();
        if (trimmed === '' || trimmed.startsWith('//')) {
            insertLine++;
            continue;
        }
        if (trimmed.startsWith('取り込む')) {
            insertLine++;
            continue;
        }
        break;
    }
    return insertLine;
}

function findInsertionPoint(document: vscode.TextDocument, startLine: number): number {
    const lines = document.getText().split('\n');
    let depth = 1;
    for (let i = startLine + 1; i < lines.length; i++) {
        const trimmed = lines[i].replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();
        if (/^(関数|生成関数|もし|条件|型|試行|選択|照合|列挙|初期化)\b/.test(trimmed)) {
            depth++;
        }
        if (/繰り返す\s*$/.test(trimmed)) { depth++; }
        if (/の間\s*$/.test(trimmed)) { depth++; }
        if (/^終わり\s*$/.test(trimmed)) {
            depth--;
            if (depth === 0) { return i - 1; }
        }
        // 次のトップレベル定義が来たら、その前に挿入
        if (depth === 1 && /^(関数|型|変数|定数|取り込む)\b/.test(trimmed) && i > startLine + 1) {
            return i - 1;
        }
    }
    return lines.length - 1;
}
