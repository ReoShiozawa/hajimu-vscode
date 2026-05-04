import * as vscode from 'vscode';
import { KEYWORDS, BUILTIN_FUNCTIONS, getInputExpansionAliases } from './languageData';
import { PLUGINS, parseImports, findPluginByAlias, PluginInfo } from './pluginData';
import { getRomajiExpansionConfig } from './config';

export function registerCompletionProvider(context: vscode.ExtensionContext) {
    // メイン補完プロバイダ
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
                const romajiConfig = getRomajiExpansionConfig(document.uri);
                const insideIdentifier = isInsideIdentifier(lineText, position.character);

                // プラグイン関数補完: "エイリアス." のパターンを検出
                const dotMatch = linePrefix.match(/([\p{L}_][\p{L}\p{N}_]*)\.$/u);
                if (dotMatch) {
                    const alias = dotMatch[1];
                    const importMap = parseImports(document.getText());
                    const plugin = importMap.get(alias);
                    if (plugin) {
                        return createPluginFunctionItems(plugin, alias);
                    }
                    // エイリアスがインポートされてなくてもプラグイン名っぽければ候補を出す
                    const pluginByAlias = findPluginByAlias(alias);
                    if (pluginByAlias) {
                        return createPluginFunctionItems(pluginByAlias, alias);
                    }
                    return items;
                }

                // プラグイン関数補完: エイリアス[" の形式
                const bracketMatch = linePrefix.match(/([\p{L}_][\p{L}\p{N}_]*)\s*\[\s*"[^"]*$/u);
                if (bracketMatch) {
                    const alias = bracketMatch[1];
                    const importMap = parseImports(document.getText());
                    const plugin = importMap.get(alias) || findPluginByAlias(alias);
                    if (plugin) {
                        return createPluginFunctionItems(plugin, alias, 'bracket');
                    }
                    return items;
                }

                // 取り込み文の補完
                const importMatch = linePrefix.match(/取り込む\s*"([^"]*)?$/);
                if (importMatch) {
                    for (const p of PLUGINS) {
                        const item = new vscode.CompletionItem(p.pluginName, vscode.CompletionItemKind.Module);
                        item.detail = `${p.displayName} v${p.version}`;
                        item.documentation = new vscode.MarkdownString(
                            `**${p.displayName}** (${p.pluginName})\n\n` +
                            `v${p.version} — ${p.functions.length} 関数\n\n` +
                            `推奨エイリアス: ${p.commonAliases.join(', ')}`
                        );
                        item.insertText = new vscode.SnippetString(`${p.pluginName}" として \${1:${p.displayName}}`);
                        item.sortText = `0_${p.displayName}_${p.pluginName}`;
                        items.push(item);
                    }
                    return items;
                }

                if (romajiConfig.enabled && !insideIdentifier && !isInCommentOrString(linePrefix)) {
                    for (const expansion of getInputExpansionAliases(romajiConfig.includeEnglishAliases)) {
                        const item = new vscode.CompletionItem(expansion.alias, vscode.CompletionItemKind.Keyword);
                        item.detail = `${expansion.alias} → ${expansion.output}`;
                        item.documentation = new vscode.MarkdownString(
                            `**${expansion.output}**\n\n` +
                            `${expansion.description}\n\n` +
                            `入力種別: ${inputKindLabel(expansion.aliasKind)}\n\n` +
                            `カテゴリ: ${expansion.category}`
                        );
                        item.insertText = expansion.output;
                        item.filterText = expansion.alias;
                        item.sortText = `00_input_${expansion.alias}`;
                        items.push(item);
                    }
                }

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
                        `\`\`\`hajimu\n${fn.signature}\n\`\`\`\n\n` +
                        `カテゴリ: ${fn.category}`
                    );
                    item.insertText = new vscode.SnippetString(`${fn.name}($1)`);
                    item.command = {
                        command: 'editor.action.triggerParameterHints',
                        title: 'Trigger Parameter Hints'
                    };
                    items.push(item);
                }

                // プラグインエイリアスの補完 (取り込み済みの場合)
                const importMap = parseImports(document.getText());
                for (const [alias, plugin] of importMap.entries()) {
                    const item = new vscode.CompletionItem(alias, vscode.CompletionItemKind.Module);
                    item.detail = `${plugin.displayName} (${plugin.pluginName})`;
                    item.documentation = new vscode.MarkdownString(
                        `**${plugin.displayName}** v${plugin.version}\n\n` +
                        `\`${alias}.関数名()\` でプラグイン関数を呼び出せます\n\n` +
                        `${plugin.functions.length} 関数が利用可能`
                    );
                    item.insertText = alias + '.';
                    item.command = {
                        command: 'editor.action.triggerSuggest',
                        title: 'Trigger Suggest'
                    };
                    items.push(item);
                }

                // ドキュメント内の識別子も補完候補に
                const text = document.getText();
                const identifiers = new Set<string>();
                const varRegex = /(?:変数|定数)\s+([\p{L}_][\p{L}\p{N}_]*)/gu;
                let match;
                while ((match = varRegex.exec(text)) !== null) {
                    identifiers.add(match[1]);
                }
                const funcRegex = /(?:関数|生成関数)\s+([\p{L}_][\p{L}\p{N}_]*)/gu;
                while ((match = funcRegex.exec(text)) !== null) {
                    identifiers.add(match[1]);
                }
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
        '', '.' // ドットでもトリガー
    );

    context.subscriptions.push(provider);
}

function createPluginFunctionItems(
    plugin: PluginInfo,
    alias: string,
    accessStyle: 'dot' | 'bracket' = 'dot'
): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const categories = new Set(plugin.functions.map(f => f.category));

    for (const fn of plugin.functions) {
        const item = new vscode.CompletionItem(fn.name, vscode.CompletionItemKind.Method);
        item.detail = `[${fn.category}] ${alias}.${fn.name}`;
        item.documentation = new vscode.MarkdownString(
            `**${alias}.${fn.name}**\n\n` +
            `${fn.description}\n\n` +
            (fn.signature ? `**シグネチャ:**\n\`\`\`hajimu\n${alias}.${fn.signature}\n\`\`\`\n\n` : '') +
            `**カテゴリ:** ${fn.category}\n\n` +
            `**プラグイン:** ${plugin.displayName} v${plugin.version}`
        );
        item.insertText = accessStyle === 'bracket'
            ? new vscode.SnippetString(`${fn.name}"]($1)`)
            : new vscode.SnippetString(`${fn.name}($1)`);
        item.command = {
            command: 'editor.action.triggerParameterHints',
            title: 'Trigger Parameter Hints'
        };
        item.sortText = `0_${fn.category}_${fn.name}`;
        items.push(item);
    }

    return items;
}

function inputKindLabel(kind: 'romaji' | 'english' | 'short'): string {
    switch (kind) {
        case 'romaji':
            return 'ローマ字';
        case 'english':
            return '英語エイリアス';
        case 'short':
            return '短縮入力';
    }
}

function isInCommentOrString(linePrefix: string): boolean {
    let inString = false;
    let escaped = false;

    for (let i = 0; i < linePrefix.length; i++) {
        const ch = linePrefix[i];
        const next = linePrefix[i + 1];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (ch === '\\') {
            escaped = true;
            continue;
        }

        if (ch === '"') {
            inString = !inString;
            continue;
        }

        if (!inString && ch === '/' && next === '/') {
            return true;
        }
    }

    return inString;
}

function isInsideIdentifier(lineText: string, character: number): boolean {
    const before = lineText[character - 1] || '';
    const after = lineText[character] || '';
    return /[\p{L}\p{N}_]/u.test(before) && /[\p{L}\p{N}_]/u.test(after);
}
