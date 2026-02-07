import * as vscode from 'vscode';
import { KEYWORDS, BUILTIN_FUNCTIONS } from './languageData';

export function registerCompletionProvider(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerCompletionItemProvider(
        'hajimu',
        {
            provideCompletionItems(
                document: vscode.TextDocument,
                position: vscode.Position
            ): vscode.CompletionItem[] {
                const items: vscode.CompletionItem[] = [];

                // キーワード補完
                for (const kw of KEYWORDS) {
                    const item = new vscode.CompletionItem(kw.name, vscode.CompletionItemKind.Keyword);
                    item.detail = kw.detail;
                    item.documentation = new vscode.MarkdownString(kw.description);
                    item.insertText = kw.name;
                    items.push(item);
                }

                // 組み込み関数補完
                for (const fn of BUILTIN_FUNCTIONS) {
                    const item = new vscode.CompletionItem(fn.name, vscode.CompletionItemKind.Function);
                    item.detail = `[${fn.category}] ${fn.signature}`;
                    item.documentation = new vscode.MarkdownString(
                        `**${fn.name}** — ${fn.description}\n\n` +
                        `\`\`\`\n${fn.signature}\n\`\`\`\n\n` +
                        `カテゴリ: ${fn.category}`
                    );
                    // 括弧付きで挿入
                    item.insertText = new vscode.SnippetString(`${fn.name}($1)`);
                    item.command = {
                        command: 'editor.action.triggerParameterHints',
                        title: 'Trigger Parameter Hints'
                    };
                    items.push(item);
                }

                // ドキュメント内の識別子も補完候補に
                const text = document.getText();
                const identifiers = new Set<string>();
                // 変数・定数宣言から識別子を抽出
                const varRegex = /(?:変数|定数)\s+([\p{L}_][\p{L}\p{N}_]*)/gu;
                let match;
                while ((match = varRegex.exec(text)) !== null) {
                    identifiers.add(match[1]);
                }
                // 関数定義から識別子を抽出
                const funcRegex = /(?:関数|生成関数)\s+([\p{L}_][\p{L}\p{N}_]*)/gu;
                while ((match = funcRegex.exec(text)) !== null) {
                    identifiers.add(match[1]);
                }
                // 型定義から識別子を抽出
                const classRegex = /型\s+([\p{L}_][\p{L}\p{N}_]*)/gu;
                while ((match = classRegex.exec(text)) !== null) {
                    identifiers.add(match[1]);
                }

                for (const id of identifiers) {
                    const item = new vscode.CompletionItem(id, vscode.CompletionItemKind.Variable);
                    item.detail = 'ドキュメント内の識別子';
                    items.push(item);
                }

                return items;
            }
        },
        '' // すべての文字で補完をトリガー
    );

    context.subscriptions.push(provider);
}
