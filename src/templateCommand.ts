/**
 * テンプレート挿入コマンド — Cmd+Alt+ で高速テンプレート生成
 * Macユーザー向けに最適化
 */
import * as vscode from 'vscode';
import { getHajimuFormatTabSize } from './config';

interface StarterSample {
    label: string;
    description: string;
    category: string;
    code: string;
}

const STARTER_SAMPLES: StarterSample[] = [
    {
        label: '基本: 関数と条件分岐',
        description: '関数、もし、戻す、表示をまとめて試す',
        category: '基本',
        code: `関数 判定(点数):
    もし 点数 >= 80 なら
        戻す "合格"
    それ以外
        戻す "もう少し"
    終わり
終わり

変数 結果 = 判定(85)
表示("結果: " + 結果)
`
    },
    {
        label: 'GUI: 小さなウィンドウ',
        description: 'hajimu_gui の最小サンプル',
        category: 'GUI',
        code: `取り込む "hajimu_gui" として GUI

変数 アプリ = GUI.アプリ作成("はじむ GUI", 640, 360)

GUI.描画ループ(アプリ, 関数():
    GUI.テキスト("こんにちは、はじむ")
    もし GUI.ボタン("押す") なら
        表示("ボタンが押されました")
    終わり
終わり)
`
    },
    {
        label: 'Web: 簡単なサーバー',
        description: 'hajimu_web でHTTP応答を返す',
        category: 'Web',
        code: `取り込む "hajimu_web" として ウェブ

変数 サーバー = ウェブ.サーバー作成(8080)

ウェブ.GET(サーバー, "/", 関数(リクエスト):
    戻す ウェブ.JSON応答({"message": "こんにちは"})
終わり)

ウェブ.開始(サーバー)
`
    },
    {
        label: 'Discord: Bot の入口',
        description: 'hajimu_discord の基本形',
        category: 'Discord',
        code: `取り込む "hajimu_discord" として ボット

変数 クライアント = ボット.ボット作成("TOKEN")

ボット.イベント(クライアント, "ready", 関数():
    表示("Botが起動しました")
終わり)

ボット.開始(クライアント)
`
    },
    {
        label: 'ゲーム: ノベル風の状態管理',
        description: '選択肢と場面変数の小さな形',
        category: 'ゲーム',
        code: `変数 場面 = "開始"
変数 好感度 = 0

関数 セリフ(話者, 本文):
    表示(話者 + ": " + 本文)
終わり

セリフ("かなめ", "今日はどこへ行く？")

もし 場面 == "開始" なら
    好感度 = 好感度 + 1
    セリフ("主人公", "海へ行こう")
終わり
`
    }
];

export function registerTemplateCommands(context: vscode.ExtensionContext) {
    const templates = [
        {
            command: 'hajimu.insertFunctionTemplate',
            label: '関数テンプレート',
            template: getBasicFunctionTemplate(),
        },
        {
            command: 'hajimu.insertFunctionWithReturnTemplate',
            label: '関数テンプレート（戻り値あり）',
            template: getFunctionWithReturnTemplate(),
        },
        {
            command: 'hajimu.insertClassTemplate',
            label: 'クラステンプレート',
            template: getClassTemplate(),
        },
        {
            command: 'hajimu.insertIfElseTemplate',
            label: 'if-else テンプレート',
            template: getIfElseTemplate(),
        },
        {
            command: 'hajimu.insertIfElseIfTemplate',
            label: 'if-else if-else テンプレート',
            template: getIfElseIfTemplate(),
        },
        {
            command: 'hajimu.insertForLoopTemplate',
            label: 'for ループテンプレート',
            template: getForLoopTemplate(),
        },
        {
            command: 'hajimu.insertWhileLoopTemplate',
            label: 'while ループテンプレート',
            template: getWhileLoopTemplate(),
        },
        {
            command: 'hajimu.insertTryCatchTemplate',
            label: 'try-catch-finally テンプレート',
            template: getTryCatchTemplate(),
        },
    ];

    for (const tmpl of templates) {
        context.subscriptions.push(
            vscode.commands.registerCommand(tmpl.command, async () => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) { return; }

                // クリップボードにテンプレートをコピーして挿入
                const template = tmpl.template;

                // アクティブなエディタのカーソル位置にテンプレートを挿入
                const position = editor.selection.active;
                const indent = getIndentAtLine(editor, position.line);

                // テンプレートをインデント調整して挿入
                const adjustedTemplate = adjustIndentation(template, indent);

                await editor.edit((editBuilder) => {
                    editBuilder.insert(position, adjustedTemplate);
                });

                // 最初のプレースホルダにカーソルを移動
                const newPosition = editor.selection.active;
                const firstPlaceholder = adjustedTemplate.indexOf('${1:');
                if (firstPlaceholder !== -1) {
                    const lineOffset = adjustedTemplate.substring(0, firstPlaceholder).split('\n').length - 1;
                    const charOffset = adjustedTemplate
                        .split('\n')
                        .slice(-1)[0]
                        .substring(0, firstPlaceholder - adjustedTemplate.lastIndexOf('\n')).length;

                    const targetLine = newPosition.line + lineOffset;
                    const targetChar = lineOffset === 0 ? newPosition.character + firstPlaceholder : charOffset;
                    editor.selection = new vscode.Selection(
                        new vscode.Position(targetLine, targetChar),
                        new vscode.Position(targetLine, targetChar)
                    );
                }
            })
        );
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('hajimu.startFromSample', async () => {
            const selected = await vscode.window.showQuickPick(
                STARTER_SAMPLES.map(sample => ({
                    label: sample.label,
                    description: sample.category,
                    detail: sample.description,
                    sample
                })),
                {
                    placeHolder: '始めたいサンプルを選んでください'
                }
            );

            if (!selected) {
                return;
            }

            const doc = await vscode.workspace.openTextDocument({
                language: 'hajimu',
                content: selected.sample.code
            });
            await vscode.window.showTextDocument(doc, { preview: false });
        })
    );
}

/**
 * テンプレート定義
 */

export function getBasicFunctionTemplate(): string {
    return `関数 ${'{1:関数名}'}(${'{2:引数}'}):\n    ${'{3:// 処理}'}\n終わり\n`;
}

export function getFunctionWithReturnTemplate(): string {
    return `関数 ${'{1:関数名}'}(${'{2:引数}'}):\n    ${'{3:// 処理}'}\n    戻す ${'{4:値}'}\n終わり\n`;
}

export function getClassTemplate(): string {
    return `型 ${'{1:クラス名}'}:\n    初期化(${'{2:引数}'}):\n        ${'{3:自分.属性 = 値}'}\n    終わり\n\n    関数 ${'{4:メソッド名}'}(${'{5:}'}):\n        ${'{6:// 処理}'}\n    終わり\n終わり\n`;
}

export function getIfElseTemplate(): string {
    return `もし ${'{1:条件}'} なら\n    ${'{2:// 真の処理}'}\nそれ以外\n    ${'{3:// 偽の処理}'}\n終わり\n`;
}

export function getIfElseIfTemplate(): string {
    return `もし ${'{1:条件1}'} なら\n    ${'{2:// 処理1}'}\nそれ以外もし ${'{3:条件2}'} なら\n    ${'{4:// 処理2}'}\nそれ以外\n    ${'{5:// その他の処理}'}\n終わり\n`;
}

export function getForLoopTemplate(): string {
    return `${'{1:i}'} を ${'{2:0}'} から ${'{3:9}'} 繰り返す\n    ${'{4:// ループ処理}'}\n終わり\n`;
}

export function getWhileLoopTemplate(): string {
    return `条件 ${'{1:条件}'} の間\n    ${'{2:// ループ処理}'}\n終わり\n`;
}

export function getTryCatchTemplate(): string {
    return `試行:\n    ${'{1:// 処理}'}\n捕獲 ${'{2:エラー}'}:\n    ${'{3:// エラー処理}'}\n最終:\n    ${'{4:// 最終処理}'}\n終わり\n`;
}

export function getImportTemplate(): string {
    return `取り込む "${'{1:モジュール名}'}" として ${'{2:エイリアス}'}\n`;
}

export function getGuiImportTemplate(): string {
    return `取り込む "hajimu_gui" として GUI\n`;
}

export function getWebImportTemplate(): string {
    return `取り込む "hajimu_web" として ウェブ\n`;
}

export function getDiscordImportTemplate(): string {
    return `取り込む "hajimu_discord" として ボット\n`;
}

export function getRenderImportTemplate(): string {
    return `取り込む "engine_render" として 描画\n`;
}

export function getAudioImportTemplate(): string {
    return `取り込む "engine_audio" として 音声\n`;
}

export function getRpgImportTemplate(): string {
    return `取り込む "engine_rpg" として RPG\n`;
}

/**
 * ヘルパー関数
 */

function getIndentAtLine(editor: vscode.TextEditor, line: number): string {
    const lineText = editor.document.lineAt(line).text;
    const match = lineText.match(/^(\s*)/);
    return match ? match[1] : '';
}

function adjustIndentation(template: string, baseIndent: string): string {
    const tabSize = getHajimuFormatTabSize();
    const indentStr = ' '.repeat(tabSize);

    return template
        .split('\n')
        .map((line, index) => {
            if (index === 0) {
                // 最初の行はインデント調整しない（既にカーソル位置にある）
                return line;
            }
            if (line.trim() === '') {
                return ''; // 空行は空のままにする
            }
            // 各行に基本インデントを加える
            return baseIndent + indentStr + line;
        })
        .join('\n');
}
