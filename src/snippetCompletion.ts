import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * スニペットベースの補完
 * snippets/hajimu.json からプリフィックスを読み込んで
 * 自動補完候補として提供する
 */

interface SnippetEntry {
    name: string;
    prefix: string[];
    body: string[];
    description: string;
}

let snippetCache: SnippetEntry[] = [];

export function registerSnippetCompletion(context: vscode.ExtensionContext) {
    // スニペットファイルを読み込む
    loadSnippets(context);

    // スニペット補完プロバイダ
    const provider = vscode.languages.registerCompletionItemProvider(
        'hajimu',
        {
            provideCompletionItems(
                document: vscode.TextDocument,
                position: vscode.Position
            ): vscode.CompletionItem[] {
                const items: vscode.CompletionItem[] = [];
                const lineText = document.lineAt(position).text;
                const linePrefix = lineText.substring(0, position.character);
                if (isInsideIdentifier(lineText, position.character)) {
                    return items;
                }

                // 最後の単語を抽出
                const match = linePrefix.match(/\b([\p{L}\p{N}_ぁ-ん一-龯々ー]+)$/u);
                if (!match) {
                    return items;
                }

                const word = match[1];

                // スニペットのプリフィックスと照合
                for (const snippet of snippetCache) {
                    for (const prefix of snippet.prefix) {
                        // 前方一致で補完候補を追加
                        if (prefix.startsWith(word)) {
                            const item = new vscode.CompletionItem(
                                prefix,
                                vscode.CompletionItemKind.Snippet
                            );
                            item.detail = snippet.name;
                            item.documentation = new vscode.MarkdownString(snippet.description);
                            item.insertText = new vscode.SnippetString(snippet.body.join('\n'));
                            item.sortText = `zz_${prefix}`; // スニペットは下に表示
                            items.push(item);
                        }
                    }
                }

                return items;
            }
        },
        // トリガー文字
        ' '
    );

    context.subscriptions.push(provider);
}

function loadSnippets(context: vscode.ExtensionContext): void {
    try {
        // 拡張ディレクトリのスニペットファイルを探す
        const snippetsPath = path.join(context.extensionPath, 'snippets', 'hajimu.json');

        if (!fs.existsSync(snippetsPath)) {
            console.warn('スニペットファイルが見つかりません:', snippetsPath);
            return;
        }

        const content = fs.readFileSync(snippetsPath, 'utf-8');
        const snippets = JSON.parse(content);

        // JSON オブジェクトをスニペット配列に変換
        for (const [key, value] of Object.entries(snippets)) {
            const snippet = value as any;
            if (snippet.prefix && snippet.body && snippet.description) {
                snippetCache.push({
                    name: key,
                    prefix: Array.isArray(snippet.prefix) ? snippet.prefix : [snippet.prefix],
                    body: Array.isArray(snippet.body) ? snippet.body : [snippet.body],
                    description: snippet.description
                });
            }
        }

        console.log(`✅ スニペット読み込み完了: ${snippetCache.length} 件`);
    } catch (error) {
        console.error('スニペット読み込みエラー:', error);
    }
}

/**
 * スニペットのプリフィックスを日本語で検索
 */
export function searchSnippets(query: string): SnippetEntry[] {
    return snippetCache.filter(snippet =>
        snippet.name.includes(query) ||
        snippet.description.includes(query) ||
        snippet.prefix.some(p => p.includes(query))
    );
}

function isInsideIdentifier(lineText: string, character: number): boolean {
    const before = lineText[character - 1] || '';
    const after = lineText[character] || '';
    return /[\p{L}\p{N}_]/u.test(before) && /[\p{L}\p{N}_]/u.test(after);
}
