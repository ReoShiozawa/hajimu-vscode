/**
 * シンボルプロバイダ — ドキュメントシンボル & Go to Definition
 *
 * アウトラインビュー、パンくずリスト、Ctrl+クリックによる定義ジャンプを提供
 */
import * as vscode from 'vscode';
import { parseImports } from './pluginData';

interface SymbolDef {
    name: string;
    kind: vscode.SymbolKind;
    range: vscode.Range;
    selectionRange: vscode.Range;
    children?: SymbolDef[];
}

export function registerSymbolProviders(context: vscode.ExtensionContext) {
    // ドキュメントシンボル（アウトライン）
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider('hajimu', new HajimuDocumentSymbolProvider())
    );

    // 定義ジャンプ
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider('hajimu', new HajimuDefinitionProvider())
    );
}

class HajimuDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
        const symbols: vscode.DocumentSymbol[] = [];
        const lines = document.getText().split('\n');
        const stack: { symbol: vscode.DocumentSymbol; indent: number }[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trimStart();
            const indent = line.length - trimmed.length;

            // 関数定義
            let match = trimmed.match(/^(関数|生成関数)\s+([\p{L}_][\p{L}\p{N}_]*)\s*\(([^)]*)\)/u);
            if (match) {
                const name = match[2];
                const params = match[3];
                const detail = match[1] === '生成関数' ? 'ジェネレータ関数' : '関数';
                const endLine = findBlockEnd(lines, i);
                const range = new vscode.Range(i, 0, endLine, lines[endLine].length);
                const selectionRange = new vscode.Range(i, line.indexOf(name), i, line.indexOf(name) + name.length);
                const sym = new vscode.DocumentSymbol(
                    name,
                    `${detail}(${params})`,
                    match[1] === '生成関数' ? vscode.SymbolKind.Function : vscode.SymbolKind.Function,
                    range,
                    selectionRange
                );
                addToParentOrRoot(symbols, stack, sym, indent);
                continue;
            }

            // 型（クラス）定義
            match = trimmed.match(/^型\s+([\p{L}_][\p{L}\p{N}_]*)/u);
            if (match) {
                const name = match[1];
                const endLine = findBlockEnd(lines, i);
                const range = new vscode.Range(i, 0, endLine, lines[endLine].length);
                const selectionRange = new vscode.Range(i, line.indexOf(name), i, line.indexOf(name) + name.length);
                const sym = new vscode.DocumentSymbol(
                    name,
                    '型',
                    vscode.SymbolKind.Class,
                    range,
                    selectionRange
                );
                addToParentOrRoot(symbols, stack, sym, indent);
                stack.push({ symbol: sym, indent });
                continue;
            }

            // 列挙型
            match = trimmed.match(/^列挙\s+([\p{L}_][\p{L}\p{N}_]*)/u);
            if (match) {
                const name = match[1];
                const endLine = findBlockEnd(lines, i);
                const range = new vscode.Range(i, 0, endLine, lines[endLine].length);
                const selectionRange = new vscode.Range(i, line.indexOf(name), i, line.indexOf(name) + name.length);
                const sym = new vscode.DocumentSymbol(
                    name,
                    '列挙型',
                    vscode.SymbolKind.Enum,
                    range,
                    selectionRange
                );
                addToParentOrRoot(symbols, stack, sym, indent);
                continue;
            }

            // 変数/定数宣言
            match = trimmed.match(/^(変数|定数)\s+([\p{L}_][\p{L}\p{N}_]*)\s*=/u);
            if (match) {
                const name = match[2];
                const kind = match[1] === '定数' ? vscode.SymbolKind.Constant : vscode.SymbolKind.Variable;
                const range = new vscode.Range(i, 0, i, line.length);
                const selectionRange = new vscode.Range(i, line.indexOf(name), i, line.indexOf(name) + name.length);
                const sym = new vscode.DocumentSymbol(
                    name,
                    match[1],
                    kind,
                    range,
                    selectionRange
                );
                addToParentOrRoot(symbols, stack, sym, indent);
                continue;
            }

            // 初期化（コンストラクタ）
            if (/^初期化\s*\(/.test(trimmed)) {
                const endLine = findBlockEnd(lines, i);
                const range = new vscode.Range(i, 0, endLine, lines[endLine].length);
                const selectionRange = new vscode.Range(i, indent, i, indent + 3);
                const sym = new vscode.DocumentSymbol(
                    '初期化',
                    'コンストラクタ',
                    vscode.SymbolKind.Constructor,
                    range,
                    selectionRange
                );
                addToParentOrRoot(symbols, stack, sym, indent);
                continue;
            }

            // 「終わり」でスタックから抜ける
            if (/^終わり\s*$/.test(trimmed)) {
                while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
                    stack.pop();
                }
            }
        }

        return symbols;
    }
}

function addToParentOrRoot(
    root: vscode.DocumentSymbol[],
    stack: { symbol: vscode.DocumentSymbol; indent: number }[],
    sym: vscode.DocumentSymbol,
    indent: number
) {
    // 適切な親を見つける
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
    }
    if (stack.length > 0) {
        stack[stack.length - 1].symbol.children.push(sym);
    } else {
        root.push(sym);
    }
}

function findBlockEnd(lines: string[], startLine: number): number {
    let depth = 1;
    for (let i = startLine + 1; i < lines.length; i++) {
        const trimmed = lines[i].replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();
        if (/^(関数|生成関数|もし|条件|型|試行|選択|照合|列挙|初期化)\b/.test(trimmed) && !trimmed.includes('終わり')) {
            depth++;
        }
        if (/繰り返す\s*$/.test(trimmed)) { depth++; }
        if (/の間\s*$/.test(trimmed)) { depth++; }
        if (/^終わり\s*$/.test(trimmed)) {
            depth--;
            if (depth === 0) { return i; }
        }
    }
    return lines.length - 1;
}

class HajimuDefinitionProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Definition | undefined {
        const wordRange = document.getWordRangeAtPosition(position, /[\p{L}\p{N}_]+/u);
        if (!wordRange) { return undefined; }
        const word = document.getText(wordRange);

        const text = document.getText();
        const lines = text.split('\n');

        // 関数定義を検索
        for (let i = 0; i < lines.length; i++) {
            const funcMatch = lines[i].match(new RegExp(`(関数|生成関数)\\s+${escapeRegExp(word)}\\s*\\(`));
            if (funcMatch) {
                const col = lines[i].indexOf(word);
                return new vscode.Location(document.uri, new vscode.Position(i, col));
            }
        }

        // 型定義を検索
        for (let i = 0; i < lines.length; i++) {
            const classMatch = lines[i].match(new RegExp(`型\\s+${escapeRegExp(word)}\\b`));
            if (classMatch) {
                const col = lines[i].indexOf(word);
                return new vscode.Location(document.uri, new vscode.Position(i, col));
            }
        }

        // 変数/定数定義を検索
        for (let i = 0; i < lines.length; i++) {
            const varMatch = lines[i].match(new RegExp(`(変数|定数)\\s+${escapeRegExp(word)}\\s*=`));
            if (varMatch) {
                const col = lines[i].indexOf(word);
                return new vscode.Location(document.uri, new vscode.Position(i, col));
            }
        }

        return undefined;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
