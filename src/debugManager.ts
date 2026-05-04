import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { breakpointManager } from './breakpointManager';

/**
 * デバッグ実行管理
 * - jp ファイルをデバッグモードで実行
 * - コンソール出力をキャプチャ
 * - 実行停止・再実行を管理
 */

class DebugManager {
    private outputChannel: vscode.OutputChannel;
    private currentProcess: cp.ChildProcess | null = null;
    private isRunning: boolean = false;
    private breakpointLines: Map<string, number[]> = new Map();

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('はじむ デバッグ');
    }

    /**
     * デバッグモードでファイルを実行
     */
    async runDebug(filePath: string): Promise<void> {
        if (this.isRunning) {
            vscode.window.showWarningMessage('既に実行中です');
            return;
        }

        this.isRunning = true;
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine(`✅ デバッグ実行開始: ${path.basename(filePath)}`);
        this.outputChannel.appendLine(`📍 ブレークポイント数: ${breakpointManager.getAllBreakpoints().length}`);
        this.outputChannel.appendLine('---');

        try {
            // nihongo インタプリタを実行
            const nihongoPath = await this.findNihongoInterpreter();
            if (!nihongoPath) {
                throw new Error('はじむインタプリタが見つかりません');
            }

            // ブレークポイント情報をコマンドラインで渡す
            const breakpoints = breakpointManager.getBreakpoints(filePath);
            const bpLines = breakpoints.map(bp => bp.line).join(',');
            const envVars = {
                ...process.env,
                HAJIMU_DEBUG: '1',
                HAJIMU_BREAKPOINTS: bpLines,
                HAJIMU_FILE: filePath
            };

            this.currentProcess = cp.spawn(nihongoPath, [filePath], {
                env: envVars,
                cwd: path.dirname(filePath)
            });

            // 標準出力をキャプチャ
            this.currentProcess.stdout?.on('data', (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        this.outputChannel.appendLine(line);
                    }
                }
            });

            // 標準エラーをキャプチャ
            this.currentProcess.stderr?.on('data', (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        this.outputChannel.appendLine(`❌ ${line}`);
                    }
                }
            });

            // プロセス終了時
            this.currentProcess.on('close', (code) => {
                this.isRunning = false;
                this.currentProcess = null;
                this.outputChannel.appendLine('---');
                if (code === 0) {
                    this.outputChannel.appendLine('✅ デバッグ実行完了');
                } else {
                    this.outputChannel.appendLine(`❌ エラーで終了 (終了コード: ${code})`);
                }
            });

            this.currentProcess.on('error', (err) => {
                this.isRunning = false;
                this.currentProcess = null;
                this.outputChannel.appendLine(`❌ 実行エラー: ${err.message}`);
            });
        } catch (error) {
            this.isRunning = false;
            this.outputChannel.appendLine(`❌ ${error instanceof Error ? error.message : String(error)}`);
            vscode.window.showErrorMessage(`デバッグ実行失敗: ${error}`);
        }
    }

    /**
     * デバッグ実行を停止
     */
    stop(): void {
        if (this.currentProcess) {
            this.currentProcess.kill();
            this.isRunning = false;
            this.currentProcess = null;
            this.outputChannel.appendLine('⏹️  デバッグ実行を停止しました');
        }
    }

    /**
     * はじむインタプリタのパスを探す
     */
    private async findNihongoInterpreter(): Promise<string | null> {
        // VS Code のワークスペース設定から取得
        const config = vscode.workspace.getConfiguration('hajimu');
        const customPath = config.get<string>('interpreter.path');

        if (customPath) {
            return customPath;
        }

        // デフォルトパスを試す
        const defaultPaths = [
            '/usr/local/bin/nihongo',
            '/usr/bin/nihongo',
            path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath || '', '..', '..', 'jp', 'nihongo')
        ];

        for (const p of defaultPaths) {
            try {
                const exists = await vscode.workspace.fs.stat(vscode.Uri.file(p));
                if (exists) {
                    return p;
                }
            } catch {
                // ファイルが存在しない
            }
        }

        return null;
    }

    /**
     * デバッグ情報をコンソールに出力
     */
    logDebugInfo(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }
}

export const debugManager = new DebugManager();

/**
 * デバッグコマンドを登録
 */
export function registerDebugCommands(context: vscode.ExtensionContext) {
    // デバッグ実行
    const debugRunCommand = vscode.commands.registerCommand('hajimu.debug', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'hajimu') {
            vscode.window.showErrorMessage('はじむファイルを開いてください');
            return;
        }

        await editor.document.save();
        await debugManager.runDebug(editor.document.fileName);
    });

    // デバッグ停止
    const debugStopCommand = vscode.commands.registerCommand('hajimu.debugStop', () => {
        debugManager.stop();
    });

    // ブレークポイント設定
    const toggleBpCommand = vscode.commands.registerCommand('hajimu.toggleBreakpoint', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'hajimu') {
            return;
        }

        const file = editor.document.fileName;
        const line = editor.selection.active.line;
        const existing = breakpointManager.getBreakpoints(file).find(bp => bp.line === line);

        if (existing) {
            breakpointManager.removeBreakpoint(file, line);
            vscode.window.showInformationMessage(`ブレークポイントを削除しました (行 ${line + 1})`);
        } else {
            breakpointManager.addBreakpoint(file, line);
            vscode.window.showInformationMessage(`ブレークポイントを設定しました (行 ${line + 1})`);
        }
    });

    // 全ブレークポイント表示
    const showBreakpointsCommand = vscode.commands.registerCommand('hajimu.showBreakpoints', () => {
        const allBps = breakpointManager.getAllBreakpoints();
        if (allBps.length === 0) {
            vscode.window.showInformationMessage('ブレークポイントがありません');
            return;
        }

        const items = allBps.map(bp => ({
            label: `${path.basename(bp.file)}:${bp.line + 1}`,
            description: bp.condition ? `条件: ${bp.condition}` : '',
            bp
        }));

        vscode.window.showQuickPick(items).then(selected => {
            if (selected) {
                vscode.workspace.openTextDocument(selected.bp.file).then(doc => {
                    vscode.window.showTextDocument(doc).then(editor => {
                        editor.selection = new vscode.Selection(selected.bp.line, 0, selected.bp.line, 0);
                        editor.revealRange(new vscode.Range(selected.bp.line, 0, selected.bp.line, 0));
                    });
                });
            }
        });
    });

    // 全ブレークポイント削除
    const clearBreakpointsCommand = vscode.commands.registerCommand('hajimu.clearAllBreakpoints', () => {
        breakpointManager.clearAll();
        vscode.window.showInformationMessage('全ブレークポイントをクリアしました');
    });

    context.subscriptions.push(
        debugRunCommand,
        debugStopCommand,
        toggleBpCommand,
        showBreakpointsCommand,
        clearBreakpointsCommand
    );
}
