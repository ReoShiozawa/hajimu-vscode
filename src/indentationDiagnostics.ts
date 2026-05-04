import * as vscode from 'vscode';

/**
 * インデント エラー検出
 * - 不適切なインデントを検出
 * - ブロック構造の不一致を検出
 * - 警告として表示
 */

export function registerIndentationDiagnostics(context: vscode.ExtensionContext) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('hajimu-indent');

    const updateDiagnostics = (document: vscode.TextDocument) => {
        if (document.languageId !== 'hajimu') {
            diagnosticCollection.delete(document.uri);
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const lines = document.getText().split('\n');
        const tabSize = 4;

        let expectedIndentStack: number[] = [0]; // インデント レベルのスタック
        const blockKeywords = ['関数', '型', 'もし', '試行', '繰り返す', '条件', '一方'];
        const endKeyword = '終わり';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // 空行またはコメント行はスキップ
            if (!trimmed || trimmed.startsWith('#')) continue;

            // 現在のインデント レベル
            const indentMatch = line.match(/^(\s*)/);
            const currentIndent = indentMatch ? indentMatch[1].length : 0;

            // インデント レベル（タブ数）
            const currentLevel = Math.floor(currentIndent / tabSize);
            const expectedLevel = expectedIndentStack[expectedIndentStack.length - 1];

            // ブロック開始キーワード
            const startsBlock = blockKeywords.some(kw => trimmed.startsWith(kw) || trimmed.includes(kw + ' '));
            const isBlockStart = startsBlock && (trimmed.endsWith(':') || /:\s*$/.test(trimmed));

            // ブロック終了キーワード
            const isBlockEnd = trimmed === endKeyword;

            // インデント エラーを検出
            if (!isBlockEnd && currentLevel !== expectedLevel && currentLevel > 0) {
                // インデント不一致
                const range = new vscode.Range(i, 0, i, currentIndent);
                const message = `予期されたインデント レベル: ${expectedLevel * tabSize} スペース（${expectedLevel}タブ）、実際: ${currentIndent} スペース（${currentLevel}タブ）`;

                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        message,
                        vscode.DiagnosticSeverity.Warning
                    )
                );
            }

            // ブロック構造の管理
            if (isBlockStart) {
                expectedIndentStack.push(expectedLevel + 1);
            } else if (isBlockEnd) {
                if (expectedIndentStack.length > 1) {
                    expectedIndentStack.pop();
                } else {
                    // 余分な「終わり」
                    const range = new vscode.Range(i, 0, i, trimmed.length);
                    diagnostics.push(
                        new vscode.Diagnostic(
                            range,
                            '「終わり」に対応するブロック開始がありません',
                            vscode.DiagnosticSeverity.Error
                        )
                    );
                }

                // 「終わり」のインデント チェック
                const expectedEndIndent = (expectedIndentStack.length - 1) * tabSize;
                if (currentIndent !== expectedEndIndent) {
                    const range = new vscode.Range(i, 0, i, currentIndent);
                    diagnostics.push(
                        new vscode.Diagnostic(
                            range,
                            `「終わり」のインデント レベルが不正です（予期値: ${expectedEndIndent}）`,
                            vscode.DiagnosticSeverity.Warning
                        )
                    );
                }
            }
        }

        // ブロックが閉じられていない場合の警告
        if (expectedIndentStack.length > 1) {
            const lastLine = lines.length - 1;
            diagnostics.push(
                new vscode.Diagnostic(
                    new vscode.Range(lastLine, 0, lastLine, lines[lastLine].length),
                    `ブロックが閉じられていません（開かれたブロック: ${expectedIndentStack.length - 1}個）`,
                    vscode.DiagnosticSeverity.Error
                )
            );
        }

        diagnosticCollection.set(document.uri, diagnostics);
    };

    // ドキュメント変更時に診断を更新
    vscode.workspace.onDidChangeTextDocument(
        event => {
            if (event.document.languageId === 'hajimu') {
                updateDiagnostics(event.document);
            }
        },
        null,
        context.subscriptions
    );

    // 既に開かれているドキュメントに対して診断を実行
    vscode.workspace.textDocuments.forEach(doc => {
        if (doc.languageId === 'hajimu') {
            updateDiagnostics(doc);
        }
    });

    // ドキュメント を開いた時
    vscode.workspace.onDidOpenTextDocument(
        doc => {
            if (doc.languageId === 'hajimu') {
                updateDiagnostics(doc);
            }
        },
        null,
        context.subscriptions
    );

    context.subscriptions.push(diagnosticCollection);
}
