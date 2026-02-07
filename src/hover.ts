import * as vscode from 'vscode';
import { KEYWORDS, BUILTIN_FUNCTIONS } from './languageData';

export function registerHoverProvider(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerHoverProvider('hajimu', {
        provideHover(
            document: vscode.TextDocument,
            position: vscode.Position
        ): vscode.Hover | undefined {
            const wordRange = document.getWordRangeAtPosition(position, /[\p{L}\p{N}_]+/u);
            if (!wordRange) {
                return undefined;
            }
            const word = document.getText(wordRange);

            // キーワードをチェック
            const keyword = KEYWORDS.find(kw => kw.name === word);
            if (keyword) {
                const md = new vscode.MarkdownString();
                md.appendMarkdown(`## キーワード: \`${keyword.name}\`\n\n`);
                md.appendMarkdown(`${keyword.description}\n\n`);
                md.appendMarkdown(`**構文:**\n\`\`\`hajimu\n${keyword.detail}\n\`\`\``);
                return new vscode.Hover(md, wordRange);
            }

            // 組み込み関数をチェック
            const builtin = BUILTIN_FUNCTIONS.find(fn => fn.name === word);
            if (builtin) {
                const md = new vscode.MarkdownString();
                md.appendMarkdown(`## 組み込み関数: \`${builtin.name}\`\n\n`);
                md.appendMarkdown(`${builtin.description}\n\n`);
                md.appendMarkdown(`**シグネチャ:**\n\`\`\`hajimu\n${builtin.signature}\n\`\`\`\n\n`);
                md.appendMarkdown(`**カテゴリ:** ${builtin.category}`);
                return new vscode.Hover(md, wordRange);
            }

            return undefined;
        }
    });

    context.subscriptions.push(provider);
}
