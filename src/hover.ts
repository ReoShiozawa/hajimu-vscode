import * as vscode from 'vscode';
import { KEYWORDS, BUILTIN_FUNCTIONS, getEnglishConceptTerms } from './languageData';
import { findPluginByAlias, parseImports } from './pluginData';

export function registerHoverProvider(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerHoverProvider('hajimu', {
        provideHover(
            document: vscode.TextDocument,
            position: vscode.Position
        ): vscode.Hover | undefined {
            const line = document.lineAt(position).text;

            // プラグイン関数のホバー: "エイリアス.関数名" パターン
            const pluginHover = getPluginFunctionHover(document, position, line);
            if (pluginHover) { return pluginHover; }

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
                appendEnglishConceptTerms(md, keyword.name);
                md.appendMarkdown(`**構文:**\n\`\`\`hajimu\n${keyword.detail}\n\`\`\`\n\n`);
                // examples を表示
                if (keyword.examples && keyword.examples.length > 0) {
                    md.appendMarkdown(`**使用例:**\n`);
                    for (const ex of keyword.examples) {
                        md.appendMarkdown(`\`\`\`hajimu\n${ex}\n\`\`\`\n`);
                    }
                }
                return new vscode.Hover(md, wordRange);
            }

            // 組み込み関数をチェック
            const builtin = BUILTIN_FUNCTIONS.find(fn => fn.name === word);
            if (builtin) {
                const md = new vscode.MarkdownString();
                md.appendMarkdown(`## 組み込み関数: \`${builtin.name}\`\n\n`);
                md.appendMarkdown(`${builtin.description}\n\n`);
                appendEnglishConceptTerms(md, builtin.name);
                md.appendMarkdown(`**シグネチャ:**\n\`\`\`hajimu\n${builtin.signature}\n\`\`\`\n\n`);
                md.appendMarkdown(`**カテゴリ:** ${builtin.category}`);
                // examples を表示
                if (builtin.examples && builtin.examples.length > 0) {
                    md.appendMarkdown(`\n\n**使用例:**\n`);
                    for (const ex of builtin.examples) {
                        md.appendMarkdown(`\`\`\`hajimu\n${ex}\n\`\`\`\n`);
                    }
                }
                return new vscode.Hover(md, wordRange);
            }

            // プラグインエイリアス自体のホバー
            const importMap = parseImports(document.getText());
            const plugin = importMap.get(word);
            if (plugin) {
                const md = new vscode.MarkdownString();
                md.appendMarkdown(`## プラグイン: \`${word}\` (${plugin.displayName})\n\n`);
                md.appendMarkdown(`**モジュール:** \`${plugin.pluginName}\`\n\n`);
                md.appendMarkdown(`**バージョン:** v${plugin.version}\n\n`);
                md.appendMarkdown(`**関数数:** ${plugin.functions.length}\n\n`);
                // カテゴリ一覧
                const cats = [...new Set(plugin.functions.map(f => f.category))];
                md.appendMarkdown(`**カテゴリ:** ${cats.join(', ')}\n\n`);
                md.appendMarkdown(`---\n\n\`${word}.関数名()\` で呼び出せます`);
                return new vscode.Hover(md, wordRange);
            }

            // ドキュメント内の関数定義のホバー
            const userFuncHover = getUserDefinedHover(document, word, wordRange);
            if (userFuncHover) { return userFuncHover; }

            return undefined;
        }
    });

    context.subscriptions.push(provider);
}

function getPluginFunctionHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    line: string
): vscode.Hover | undefined {
    // カーソル位置周辺で "エイリアス.関数名" を探す
    const pattern = /([\p{L}_][\p{L}\p{N}_]*)\.([\p{L}_][\p{L}\p{N}_]*)/gu;
    let match;
    while ((match = pattern.exec(line)) !== null) {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;
        if (position.character >= matchStart && position.character <= matchEnd) {
            const alias = match[1];
            const funcName = match[2];

            const importMap = parseImports(document.getText());
            let plugin = importMap.get(alias);
            if (!plugin) {
                // よく使われるエイリアスも検索
                plugin = findPluginByAlias(alias);
            }
            if (plugin) {
                const func = plugin.functions.find(f => f.name === funcName);
                if (func) {
                    const md = new vscode.MarkdownString();
                    md.appendMarkdown(`## ${plugin.displayName}: \`${alias}.${func.name}\`\n\n`);
                    md.appendMarkdown(`${func.description}\n\n`);
                    if (func.signature) {
                        md.appendMarkdown(`**シグネチャ:**\n\`\`\`hajimu\n${alias}.${func.signature}\n\`\`\`\n\n`);
                    }
                    md.appendMarkdown(`**カテゴリ:** ${func.category}\n\n`);
                    md.appendMarkdown(`**プラグイン:** ${plugin.displayName} v${plugin.version}`);
                    // examples を表示
                    if (func.examples && func.examples.length > 0) {
                        md.appendMarkdown(`\n\n**使用例:**\n`);
                        for (const ex of func.examples) {
                            md.appendMarkdown(`\`\`\`hajimu\n${ex}\n\`\`\`\n`);
                        }
                    }
                    const range = new vscode.Range(
                        position.line, matchStart,
                        position.line, matchEnd
                    );
                    return new vscode.Hover(md, range);
                }
            }
        }
    }
    return getPluginBracketFunctionHover(document, position, line);
}

function getPluginBracketFunctionHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    line: string
): vscode.Hover | undefined {
    const pattern = /([\p{L}_][\p{L}\p{N}_]*)\s*\[\s*"([^"]+)"\s*\]/gu;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;
        if (position.character < matchStart || position.character > matchEnd) {
            continue;
        }

        const alias = match[1];
        const funcName = match[2];
        const importMap = parseImports(document.getText());
        const plugin = importMap.get(alias) || findPluginByAlias(alias);
        const func = plugin?.functions.find(f => f.name === funcName);
        if (!plugin || !func) {
            continue;
        }

        const md = new vscode.MarkdownString();
        md.appendMarkdown(`## ${plugin.displayName}: \`${alias}["${func.name}"]\`\n\n`);
        md.appendMarkdown(`${func.description}\n\n`);
        if (func.signature) {
            md.appendMarkdown(`**シグネチャ:**\n\`\`\`hajimu\n${alias}["${func.name}"](...)\n\`\`\`\n\n`);
        }
        md.appendMarkdown(`**カテゴリ:** ${func.category}\n\n`);
        md.appendMarkdown(`**プラグイン:** ${plugin.displayName} v${plugin.version}`);
        return new vscode.Hover(md, new vscode.Range(position.line, matchStart, position.line, matchEnd));
    }

    return undefined;
}

function getUserDefinedHover(
    document: vscode.TextDocument,
    word: string,
    wordRange: vscode.Range
): vscode.Hover | undefined {
    const text = document.getText();

    // 関数定義を探す
    const funcPattern = new RegExp(
        `(?:関数|生成関数)\\s+${escapeRegex(word)}\\s*\\(([^)]*)\\)`, 'u'
    );
    const funcMatch = funcPattern.exec(text);
    if (funcMatch) {
        const params = funcMatch[1];
        const isGenerator = funcMatch[0].startsWith('生成関数');
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`## ${isGenerator ? '生成関数' : '関数'}: \`${word}\`\n\n`);
        md.appendMarkdown(`\`\`\`hajimu\n${isGenerator ? '生成関数' : '関数'} ${word}(${params}):\n\`\`\`\n\n`);
        md.appendMarkdown(`*ドキュメント内で定義*`);
        return new vscode.Hover(md, wordRange);
    }

    // 型定義を探す
    const classPattern = new RegExp(`型\\s+${escapeRegex(word)}\\b`, 'u');
    if (classPattern.test(text)) {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`## 型: \`${word}\`\n\n`);
        md.appendMarkdown(`*ドキュメント内で定義されたクラス*`);
        return new vscode.Hover(md, wordRange);
    }

    return undefined;
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function appendEnglishConceptTerms(md: vscode.MarkdownString, name: string): void {
    const terms = getEnglishConceptTerms(name);
    if (terms.length === 0) {
        return;
    }

    md.appendMarkdown(`**英語圏の用語:** ${terms.map(term => `\`${term}\``).join(', ')}\n\n`);
}
