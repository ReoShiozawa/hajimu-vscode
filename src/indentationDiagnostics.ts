import * as vscode from 'vscode';

/**
 * インデントは可読性の補助であり、はじむの構文条件ではない。
 * そのため、確実に入力事故と判断できる空白だけを診断する。
 */
export function registerIndentationDiagnostics(context: vscode.ExtensionContext) {
    const collection = vscode.languages.createDiagnosticCollection('hajimu-indent');

    const update = (document: vscode.TextDocument) => {
        if (document.languageId !== 'hajimu' ||
            !vscode.workspace.getConfiguration('hajimu', document.uri).get('editor.indentDiagnostics', false)) {
            collection.delete(document.uri);
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        for (let lineNo = 0; lineNo < document.lineCount; lineNo++) {
            const line = document.lineAt(lineNo).text;
            const indent = line.match(/^[\t \u3000]*/u)?.[0] || '';
            if (indent.includes('\u3000')) {
                const index = indent.indexOf('\u3000');
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(lineNo, index, lineNo, index + 1),
                    'インデントに全角空白があります。半角空白またはタブへ置き換えてください',
                    vscode.DiagnosticSeverity.Warning
                ));
            }
            if (indent.includes('\t') && indent.includes(' ')) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(lineNo, 0, lineNo, indent.length),
                    'インデントにタブと半角空白が混在しています',
                    vscode.DiagnosticSeverity.Information
                ));
            }
        }
        collection.set(document.uri, diagnostics);
    };

    context.subscriptions.push(
        collection,
        vscode.workspace.onDidChangeTextDocument(event => update(event.document)),
        vscode.workspace.onDidOpenTextDocument(update),
        vscode.workspace.onDidCloseTextDocument(document => collection.delete(document.uri)),
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('hajimu.editor.indentDiagnostics')) {
                vscode.workspace.textDocuments.forEach(update);
            }
        })
    );
    vscode.workspace.textDocuments.forEach(update);
}
