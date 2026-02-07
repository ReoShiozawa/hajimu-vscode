import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('はじむ');
    }
    return outputChannel;
}

export function registerRunCommands(context: vscode.ExtensionContext) {
    // ファイル全体を実行
    const runCommand = vscode.commands.registerCommand('hajimu.run', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('アクティブなエディタがありません');
            return;
        }

        if (editor.document.languageId !== 'hajimu') {
            vscode.window.showErrorMessage('はじむファイル (.jp) を開いてください');
            return;
        }

        // 保存されていない場合は保存
        if (editor.document.isDirty) {
            editor.document.save();
        }

        const filePath = editor.document.uri.fsPath;
        const config = vscode.workspace.getConfiguration('hajimu');
        const execPath = config.get<string>('executablePath', 'hajimu');
        const useTerminal = config.get<boolean>('runInTerminal', true);

        if (useTerminal) {
            // ターミナルで実行
            let terminal = vscode.window.terminals.find(t => t.name === 'はじむ');
            if (!terminal) {
                terminal = vscode.window.createTerminal('はじむ');
            }
            terminal.show();
            terminal.sendText(`${execPath} "${filePath}"`);
        } else {
            // 出力チャネルで実行
            const cp = require('child_process');
            const channel = getOutputChannel();
            channel.show();
            channel.appendLine(`--- 実行: ${filePath} ---`);

            const process = cp.spawn(execPath, [filePath], {
                cwd: require('path').dirname(filePath)
            });

            process.stdout.on('data', (data: Buffer) => {
                channel.append(data.toString());
            });

            process.stderr.on('data', (data: Buffer) => {
                channel.append(data.toString());
            });

            process.on('close', (code: number) => {
                channel.appendLine(`\n--- 終了 (コード: ${code}) ---`);
            });
        }
    });

    // 選択範囲を実行
    const runSelectionCommand = vscode.commands.registerCommand('hajimu.runSelection', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('テキストが選択されていません');
            return;
        }

        const selectedText = editor.document.getText(selection);
        const config = vscode.workspace.getConfiguration('hajimu');
        const execPath = config.get<string>('executablePath', 'hajimu');

        // 一時ファイルに書き込んで実行
        const fs = require('fs');
        const os = require('os');
        const path = require('path');
        const tmpFile = path.join(os.tmpdir(), '_hajimu_selection.jp');
        fs.writeFileSync(tmpFile, selectedText, 'utf-8');

        let terminal = vscode.window.terminals.find(t => t.name === 'はじむ');
        if (!terminal) {
            terminal = vscode.window.createTerminal('はじむ');
        }
        terminal.show();
        terminal.sendText(`${execPath} "${tmpFile}"`);
    });

    context.subscriptions.push(runCommand, runSelectionCommand);
}
