import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

export async function registerLanguageServer(context: vscode.ExtensionContext): Promise<boolean> {
    if (!vscode.workspace.isTrusted || !vscode.workspace.getConfiguration('hajimu').get('languageServer.enabled', true)) return false;
    const executable = vscode.workspace.getConfiguration('hajimu').get<string>('executablePath', 'hajimu');
    const client = new LanguageClient('hajimu', 'Hajimu Language Server', {
        command: process.execPath,
        args: [context.asAbsolutePath('tools/lsp.cjs'), executable],
        options: { env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } }
    }, { documentSelector: [{ scheme: 'file', language: 'hajimu' }] });
    context.subscriptions.push({ dispose: () => { void client.stop(); } });
    try { await client.start(); return true; }
    catch (error) { void vscode.window.showWarningMessage(`言語サーバーを開始できません: ${String(error)}`); return false; }
}

export function registerDebugAdapter(context: vscode.ExtensionContext): void {
    context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('hajimu', {
        createDebugAdapterDescriptor: () => new vscode.DebugAdapterExecutable(process.execPath,
            [context.asAbsolutePath('tools/dap.cjs'), vscode.workspace.getConfiguration('hajimu').get<string>('executablePath', 'hajimu')],
            { env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } })
    }));
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('hajimu', {
        resolveDebugConfiguration: (_folder, config) => {
            if (!vscode.workspace.isTrusted) return undefined;
            return { ...config, type: config.type || 'hajimu', request: config.request || 'launch', name: config.name || 'はじむ', program: config.program || vscode.window.activeTextEditor?.document.fileName };
        }
    }));
}
