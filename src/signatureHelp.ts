/**
 * シグネチャヘルプ — 関数呼び出し時にパラメータ情報を表示
 */
import * as vscode from 'vscode';
import { BUILTIN_FUNCTIONS } from './languageData';
import { PLUGINS, parseImports, PluginFuncInfo } from './pluginData';

export function registerSignatureHelp(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            'hajimu',
            new HajimuSignatureHelpProvider(),
            '(', ','
        )
    );
}

class HajimuSignatureHelpProvider implements vscode.SignatureHelpProvider {
    provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.SignatureHelp | undefined {
        const lineText = document.lineAt(position.line).text;
        const textBefore = lineText.substring(0, position.character);

        // 現在位置から逆方向に「(」を探す
        let depth = 0;
        let parenPos = -1;
        for (let i = textBefore.length - 1; i >= 0; i--) {
            if (textBefore[i] === ')') { depth++; }
            else if (textBefore[i] === '(') {
                if (depth === 0) {
                    parenPos = i;
                    break;
                }
                depth--;
            }
        }

        if (parenPos < 0) { return undefined; }

        // 関数名を取得
        const beforeParen = textBefore.substring(0, parenPos).trimEnd();

        // プラグイン関数かどうか（prefix.funcName パターン）
        const pluginMatch = beforeParen.match(/([\p{L}\p{N}_]+)\.([\p{L}\p{N}_]+)$/u);
        if (pluginMatch) {
            const alias = pluginMatch[1];
            const funcName = pluginMatch[2];
            const imports = parseImports(document.getText());
            const plugin = imports.get(alias);
            if (plugin) {
                const func = plugin.functions.find(f => f.name === funcName);
                if (func) {
                    return createSignatureHelp(func.signature, func.description, textBefore, parenPos);
                }
            }
            // エイリアスが見つからなくても、直接プラグイン名で試す
            for (const p of PLUGINS) {
                if (p.commonAliases.includes(alias)) {
                    const func = p.functions.find(f => f.name === funcName);
                    if (func) {
                        return createSignatureHelp(func.signature, func.description, textBefore, parenPos);
                    }
                }
            }
        }

        // 組み込み関数かどうか
        const builtinMatch = beforeParen.match(/([\p{L}\p{N}_]+)$/u);
        if (builtinMatch) {
            const funcName = builtinMatch[1];
            const builtin = BUILTIN_FUNCTIONS.find(f => f.name === funcName);
            if (builtin) {
                return createSignatureHelp(builtin.signature, builtin.description, textBefore, parenPos);
            }
        }

        // ドキュメント内の関数定義
        const text = document.getText();
        if (builtinMatch) {
            const funcName = builtinMatch[1];
            const funcRegex = new RegExp(`(?:関数|生成関数)\\s+${escapeRegExp(funcName)}\\s*\\(([^)]*)\\)`, 'u');
            const funcMatch = text.match(funcRegex);
            if (funcMatch) {
                const sig = `${funcName}(${funcMatch[1]})`;
                return createSignatureHelp(sig, 'ユーザー定義関数', textBefore, parenPos);
            }
        }

        return undefined;
    }
}

function createSignatureHelp(
    signature: string,
    description: string,
    textBefore: string,
    parenPos: number
): vscode.SignatureHelp {
    const help = new vscode.SignatureHelp();
    const sigInfo = new vscode.SignatureInformation(signature, description);

    // パラメータを解析
    const paramMatch = signature.match(/\(([^)]*)\)/);
    if (paramMatch) {
        const params = paramMatch[1].split(',').map(p => p.trim()).filter(p => p.length > 0);
        for (const param of params) {
            sigInfo.parameters.push(new vscode.ParameterInformation(param));
        }
    }

    help.signatures = [sigInfo];
    help.activeSignature = 0;

    // アクティブパラメータを計算
    const insideParen = textBefore.substring(parenPos + 1);
    let commaCount = 0;
    let depth = 0;
    let inStr = false;
    for (const ch of insideParen) {
        if (ch === '"') { inStr = !inStr; }
        if (inStr) { continue; }
        if (ch === '(') { depth++; }
        else if (ch === ')') { depth--; }
        else if (ch === ',' && depth === 0) { commaCount++; }
    }
    help.activeParameter = commaCount;

    return help;
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
