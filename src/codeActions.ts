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
