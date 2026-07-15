import * as vscode from 'vscode';
import {
    getBasicFunctionTemplate,
    getFunctionWithReturnTemplate,
    getClassTemplate,
    getIfElseTemplate,
    getIfElseIfTemplate,
    getForLoopTemplate,
    getWhileLoopTemplate,
    getTryCatchTemplate,
    getImportTemplate,
    getGuiImportTemplate,
    getWebImportTemplate,
    getDiscordImportTemplate,
    getRenderImportTemplate,
    getAudioImportTemplate,
    getRpgImportTemplate
} from './templateCommand';
import { getInputExpansionAliases, ResolvedInputExpansion } from './languageData';
import { getRomajiExpansionConfig } from './config';

/**
 * エイリアス短縮入力システム
 * "fn " → 関数テンプレート、"cl " → クラステンプレート、など
 */

interface AliasMapping {
    alias: string;
    description: string;
    getTemplate: () => string;
}

// エイリアス定義（優先度順）
const ALIASES: AliasMapping[] = [
    {
        alias: 'fn',
        description: '関数テンプレート',
        getTemplate: getBasicFunctionTemplate
    },
    {
        alias: 'fnr',
        description: '関数（戻す付き）テンプレート',
        getTemplate: getFunctionWithReturnTemplate
    },
    {
        alias: 'cl',
        description: 'クラステンプレート',
        getTemplate: getClassTemplate
    },
    {
        alias: 'if',
        description: 'if-else テンプレート',
        getTemplate: getIfElseTemplate
    },
    {
        alias: 'ifi',
        description: 'if-else if-else テンプレート',
        getTemplate: getIfElseIfTemplate
    },
    {
        alias: 'lp',
        description: 'for ループテンプレート',
        getTemplate: getForLoopTemplate
    },
    {
        alias: 'wh',
        description: 'while ループテンプレート',
        getTemplate: getWhileLoopTemplate
    },
    {
        alias: 'tc',
        description: 'try-catch テンプレート',
        getTemplate: getTryCatchTemplate
    },
    {
        alias: 'imp',
        description: '取り込むテンプレート',
        getTemplate: getImportTemplate
    },
    {
        alias: 'gui',
        description: 'hajimu_gui 取り込み',
        getTemplate: getGuiImportTemplate
    },
    {
        alias: 'web',
        description: 'hajimu_web 取り込み',
        getTemplate: getWebImportTemplate
    },
    {
        alias: 'bot',
        description: 'hajimu_discord 取り込み',
        getTemplate: getDiscordImportTemplate
    },
    {
        alias: 'render',
        description: 'engine_render 取り込み',
        getTemplate: getRenderImportTemplate
    },
    {
        alias: 'audio',
        description: 'engine_audio 取り込み',
        getTemplate: getAudioImportTemplate
    },
    {
        alias: 'rpg',
        description: 'engine_rpg 取り込み',
        getTemplate: getRpgImportTemplate
    }
];

export function registerAliasExpander(context: vscode.ExtensionContext) {
    // ファイル編集を監視
    const listener = vscode.workspace.onDidChangeTextDocument(async (event) => {
        if (!isHajmuFile(event.document)) {
            return;
        }

        // 最後の変更がスペース入力か確認
        const lastChange = event.contentChanges[event.contentChanges.length - 1];
        if (!lastChange || lastChange.text !== ' ') {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== event.document) {
            return;
        }

        // カーソル位置の行を取得
        const cursorPos = editor.selection.active;
        const line = editor.document.lineAt(cursorPos.line);
        const lineText = line.text.substring(0, cursorPos.character);

        // 最後の単語を抽出（スペース区切り）
        const match = lineText.match(/([\p{L}\p{N}_]+)$/u);
        if (!match) {
            return;
        }

        const word = match[1];

        // エイリアスをチェック
        const aliasMap = ALIASES.find(a => a.alias === word);

        // エイリアス + スペースを削除して置き換え
        const deleteRange = new vscode.Range(
            cursorPos.line,
            cursorPos.character - word.length - 1,  // スペースを含める
            cursorPos.line,
            cursorPos.character
        );

        if (!aliasMap) {
            const expansion = findRomajiExpansion(word, event.document, lineText, cursorPos.character - word.length - 1);
            if (!expansion) {
                return;
            }

            await editor.edit((editBuilder) => {
                editBuilder.replace(deleteRange, `${expansion.output} `);
            });
            return;
        }

        // 基本インデントを取得
        const baseIndent = line.text.match(/^\s*/)?.[0] || '';
        const config = vscode.workspace.getConfiguration('editor', event.document);
        const tabSize = (config.get('tabSize') as number) || 4;

        // テンプレート文字列を取得
        const templateString = aliasMap.getTemplate();

        // テンプレート文字列を行配列に分割
        const template = templateString.split('\n').filter(t => t !== '');

        // エディタで置き換え
        await editor.edit((editBuilder) => {
            editBuilder.replace(deleteRange, template.join('\n'));
        });

        // プレースホルダーへ移動（最初のプレースホルダーに）
        if (template.length > 0) {
            const newCursorLine = cursorPos.line;
            const newCursorChar = baseIndent.length;
            editor.selection = new vscode.Selection(
                newCursorLine,
                newCursorChar,
                newCursorLine,
                newCursorChar
            );
        }
    });

    context.subscriptions.push(listener);
}

function isHajmuFile(document: vscode.TextDocument): boolean {
    return document.languageId === 'hajimu';
}

function findRomajiExpansion(
    word: string,
    document: vscode.TextDocument,
    linePrefixWithSpace: string,
    wordStart: number
): ResolvedInputExpansion | undefined {
    const config = getRomajiExpansionConfig(document.uri);
    if (!config.enabled || !config.autoExpandOnSpace) {
        return undefined;
    }

    if (isInCommentOrString(linePrefixWithSpace.substring(0, wordStart))) {
        return undefined;
    }

    return getInputExpansionAliases(config.includeEnglishAliases).find(expansion => expansion.alias === word);
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
