import * as vscode from 'vscode';
import { registerCompletionProvider } from './completion';
import { registerHoverProvider } from './hover';
import { registerRunCommands } from './runner';

export function activate(context: vscode.ExtensionContext) {
    console.log('はじむ (Hajimu) 拡張機能がアクティブになりました');

    // コード補完
    registerCompletionProvider(context);

    // ホバー情報
    registerHoverProvider(context);

    // 実行コマンド
    registerRunCommands(context);

    // ステータスバー
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(play) はじむ';
    statusBar.tooltip = 'はじむプログラムを実行 (Cmd+Shift+R)';
    statusBar.command = 'hajimu.run';
    context.subscriptions.push(statusBar);

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && editor.document.languageId === 'hajimu') {
                statusBar.show();
            } else {
                statusBar.hide();
            }
        })
    );

    if (vscode.window.activeTextEditor?.document.languageId === 'hajimu') {
        statusBar.show();
    }
}

export function deactivate() {}
