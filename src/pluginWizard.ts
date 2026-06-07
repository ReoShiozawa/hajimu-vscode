import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * プラグインウィザード
 * - GUI / Web / Discord プラグインのセットアップを簡素化
 * - プラグイン選択 → 自動インポート & エイリアス生成
 */

interface PluginInfo {
    id: string;
    name: string;
    description: string;
    importName: string;
    alias: string;
    examples: string[];
}

const PLUGINS: Record<string, PluginInfo> = {
    gui: {
        id: 'gui',
        name: 'はじむ GUI',
        description: 'ボタン・ウィンドウ・イベント処理',
        importName: 'hajimu_gui',
        alias: 'GUI',
        examples: [
            'ウィンドウ("タイトル", 400, 300)',
            'ボタン("クリック", func)',
            'テキスト入力()',
            'メッセージボックス("タイトル", "メッセージ")'
        ]
    },
    web: {
        id: 'web',
        name: 'はじむ Web',
        description: 'HTTPサーバー・ルーティング・JSON',
        importName: 'hajimu_web',
        alias: 'Web',
        examples: [
            'サーバー起動(8000, routes)',
            'ルート("/api/data", "GET", handler)',
            'JSON送信(data)',
            'リクエスト受け取り()'
        ]
    },
    discord: {
        id: 'discord',
        name: 'はじむ Discord',
        description: 'Discordボット・メッセージ・コマンド処理',
        importName: 'hajimu_discord',
        alias: 'Discord',
        examples: [
            'ボット起動("TOKEN")',
            'メッセージ受け取り(event)',
            'メッセージ送信(channel, text)',
            'コマンド処理("!ping", func)'
        ]
    }
};

/**
 * プラグインウィザードを実行
 */
async function showPluginWizard() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'hajimu') {
        vscode.window.showErrorMessage('はじむファイルを開いてください');
        return;
    }

    // Step 1: プラグインを選択
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = Object.values(PLUGINS).map(p => ({
        label: p.name,
        description: p.description,
        detail: `エイリアス: ${p.alias}`,
        pluginInfo: p
    } as any));
    quickPick.canSelectMany = true;
    quickPick.title = 'はじむ プラグインウィザード';
    quickPick.placeholder = '追加するプラグインを選択してください（複数選択可）';
    quickPick.matchOnDescription = true;

    return new Promise<void>((resolve) => {
        quickPick.onDidAccept(async () => {
            const selected = quickPick.selectedItems as any[];
            if (selected.length === 0) {
                quickPick.hide();
                resolve();
                return;
            }

            quickPick.hide();

            // Step 2: 選択されたプラグインを処理
            for (const item of selected) {
                const plugin = item.pluginInfo as PluginInfo;
                await addPluginToFile(editor, plugin);
            }

            vscode.window.showInformationMessage(
                `✅ ${selected.length}個のプラグインを追加しました`
            );
            resolve();
        });

        quickPick.onDidHide(() => {
            resolve();
        });

        quickPick.show();
    });
}

/**
 * プラグインをファイルに追加
 */
async function addPluginToFile(editor: vscode.TextEditor, plugin: PluginInfo) {
    const document = editor.document;
    const text = document.getText();

    // 既にインポートされているか確認
    const importPattern = new RegExp(`(使う|import)\\s+['"]${plugin.importName}['"]`);
    if (importPattern.test(text)) {
        vscode.window.showWarningMessage(`${plugin.name} は既にインポートされています`);
        return;
    }

    // インポート文を生成
    const importStatement = `使う "${plugin.importName}" として ${plugin.alias}\n`;

    // ファイルの最初にインポートを追加
    const firstLineEnd = document.lineAt(0).range.end;
    const edit = new vscode.WorkspaceEdit();
    edit.insert(document.uri, firstLineEnd, '\n' + importStatement);

    await vscode.workspace.applyEdit(edit);

    // サンプルコードスニペットを挿入
    await showPluginSample(editor, plugin);
}

/**
 * プラグインのサンプルコードを表示・挿入
 */
async function showPluginSample(editor: vscode.TextEditor, plugin: PluginInfo) {
    const sampleCode = generateSampleCode(plugin);

    const items = [
        {
            label: '$(check) サンプルコードを挿入',
            description: 'エディタに基本的な使用例を挿入します',
            action: 'insert'
        },
        {
            label: '$(file-text) ドキュメントを表示',
            description: 'プラグインの詳細情報を表示します',
            action: 'docs'
        },
        {
            label: '$(close) スキップ',
            description: 'プラグインのみ追加して終了',
            action: 'skip'
        }
    ];

    const selection = await vscode.window.showQuickPick(items, {
        title: `${plugin.name} の次のステップ`,
        placeHolder: 'アクションを選択してください'
    });

    if (!selection) return;

    switch (selection.action) {
        case 'insert':
            insertSampleCode(editor, sampleCode);
            break;
        case 'docs':
            showPluginDocumentation(plugin);
            break;
        case 'skip':
            // 何もしない
            break;
    }
}

/**
 * プラグイン用のサンプルコードを生成
 */
function generateSampleCode(plugin: PluginInfo): string {
    const samples: Record<string, string> = {
        gui: `\n# ${plugin.name} の使用例
関数 main():
    ウィンドウ("はじむ GUI アプリ", 400, 300)
    \n終わり

main()
`,
        web: `\n# ${plugin.name} の使用例
ルート("/", "GET", 関数 (req): "ホームページ" 終わり)
ルート("/api/hello", "GET", 関数 (req): {"message": "Hello, World!"} 終わり)

サーバー起動(8000, routes)
`,
        discord: `\n# ${plugin.name} の使用例
ボット起動("YOUR_TOKEN_HERE")

# メッセージハンドラ
メッセージ受け取り(関数 (msg):
    もし msg.内容 == "!ping":
        msg.返信("Pong!")
    終わり
終わり)
`
    };

    return samples[plugin.id] || `\n# ${plugin.name} の使用例\n`;
}

/**
 * サンプルコードをエディタに挿入
 */
async function insertSampleCode(editor: vscode.TextEditor, code: string) {
    const document = editor.document;
    const lastLine = document.lineAt(document.lineCount - 1);
    const insertPosition = lastLine.range.end;

    const edit = new vscode.WorkspaceEdit();
    edit.insert(document.uri, insertPosition, code);

    await vscode.workspace.applyEdit(edit);
    vscode.window.showInformationMessage('✅ サンプルコードを挿入しました');
}

/**
 * プラグインドキュメントを表示
 */
async function showPluginDocumentation(plugin: PluginInfo) {
    const docs = `
# ${plugin.name}

## 説明
${plugin.description}

## インポート
\`\`\`hajimu
使う "${plugin.importName}" として ${plugin.alias}
\`\`\`

## 使用例

${plugin.examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

## 主要な関数・オブジェクト

### ${plugin.id === 'gui' ? 'GUI コンポーネント' : plugin.id === 'web' ? 'Web サーバー' : 'Discord ボット'}

詳細はドキュメントを参照してください。
- 公式リファレンス: https://hajimu.example.com/plugins/${plugin.id}
- GitHubリポジトリ: https://github.com/hajimu/hajimu_${plugin.id}
    `;

    // パネル（Webビュー）を作成して表示
    const panel = vscode.window.createWebviewPanel(
        `hajimu_${plugin.id}_docs`,
        `${plugin.name} ドキュメント`,
        vscode.ViewColumn.Beside,
        {}
    );

    panel.webview.html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1e88e5;
            border-bottom: 2px solid #1e88e5;
            padding-bottom: 10px;
        }
        h2 {
            color: #424242;
            margin-top: 20px;
        }
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        pre code {
            background: none;
            padding: 0;
        }
        a {
            color: #1e88e5;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .example-list {
            background: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #1e88e5;
            border-radius: 3px;
        }
        .example-list li {
            margin: 8px 0;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${plugin.name}</h1>

        <h2>説明</h2>
        <p>${plugin.description}</p>

        <h2>インポート方法</h2>
        <pre><code>使う "${plugin.importName}" として ${plugin.alias}</code></pre>

        <h2>使用例</h2>
        <ul class="example-list">
            ${plugin.examples.map(ex => `<li>${ex}</li>`).join('\n')}
        </ul>

        <h2>詳細リンク</h2>
        <ul>
            <li><a href="https://hajimu.example.com/plugins/${plugin.id}" target="_blank">📚 公式ドキュメント</a></li>
            <li><a href="https://github.com/hajimu/hajimu_${plugin.id}" target="_blank">🔗 GitHub リポジトリ</a></li>
        </ul>
    </div>
</body>
</html>
    `;
}

/**
 * プラグインウィザードコマンドを登録
 */
export function registerPluginWizard(context: vscode.ExtensionContext) {
    const command = vscode.commands.registerCommand('hajimu.pluginWizard', async () => {
        await showPluginWizard();
    });

    context.subscriptions.push(command);
}
