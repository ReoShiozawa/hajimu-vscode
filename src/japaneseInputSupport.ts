import * as vscode from 'vscode';
import { normalizeFullWidthCode } from './syntaxAnalysis';

const AUTO_NORMALIZABLE = /^[\uFF01-\uFF5E（）［］｛｝，：；＝＋－＊／％＜＞！＆｜．　]+$/u;

export function registerJapaneseInputSupport(context: vscode.ExtensionContext) {
    const editing = new Set<string>();

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('hajimu.normalizeFullWidthSymbols', async (editor) => {
            if (editor.document.languageId !== 'hajimu') return;
            const selections = editor.selections.some(selection => !selection.isEmpty)
                ? editor.selections.filter(selection => !selection.isEmpty)
                : [new vscode.Selection(0, 0, editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).text.length)];

            await editor.edit((builder) => {
                for (const selection of selections) {
                    const original = editor.document.getText(selection);
                    builder.replace(selection, normalizeFullWidthCode(original));
                }
            });
        }),
        vscode.workspace.onDidChangeTextDocument(async (event) => {
            const document = event.document;
            const key = document.uri.toString();
            if (document.languageId !== 'hajimu' || editing.has(key) ||
                !vscode.workspace.getConfiguration('hajimu', document.uri).get('japaneseInput.autoNormalizeFullWidthSymbols', true)) {
                return;
            }

            // 複数カーソル編集では変更位置が相互にずれるため、通常のIME入力だけを対象にする。
            if (event.contentChanges.length !== 1) return;
            const changes = event.contentChanges.filter(change => AUTO_NORMALIZABLE.test(change.text));
            if (changes.length === 0) return;
            const edit = new vscode.WorkspaceEdit();
            for (const change of changes) {
                const replacement = normalizeFullWidthCode(change.text);
                if (replacement !== change.text) {
                    const start = document.positionAt(change.rangeOffset);
                    const end = document.positionAt(change.rangeOffset + change.text.length);
                    edit.replace(document.uri, new vscode.Range(start, end), replacement);
                }
            }
            if (edit.size === 0) return;
            editing.add(key);
            try {
                await vscode.workspace.applyEdit(edit);
            } finally {
                editing.delete(key);
            }
        })
    );
}
