import * as vscode from 'vscode';
import { BUILTIN_FUNCTIONS } from './languageData';

/**
 * 改善されたシグネチャヘルプ
 * - 関数呼び出し時のパラメータリストをインラインで表示
 * - 型情報を含める
 * - 複数のオーバーロードに対応
 */

export class EnhancedSignatureHelpProvider implements vscode.SignatureHelpProvider {
    provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.SignatureHelpContext
    ): vscode.SignatureHelp | null {
        // 関数呼び出しの開き括弧を探す
        const lineText = document.lineAt(position.line).text;
        const upToPosition = lineText.substring(0, position.character);

        // 最後の開き括弧を見つける
        const lastOpenParen = upToPosition.lastIndexOf('(');
        if (lastOpenParen === -1) return null;

        // 関数名を抽出
        const beforeParen = upToPosition.substring(0, lastOpenParen).trim();
        const functionNameMatch = beforeParen.match(/(\w+)$/);
        if (!functionNameMatch) return null;

        const functionName = functionNameMatch[1];

        // 組み込み関数を検索
        const builtin = BUILTIN_FUNCTIONS.find(f => f.name === functionName);
        if (!builtin) return null;

        // シグネチャ情報を作成
        const signature = new vscode.SignatureInformation(
            builtin.signature || `${builtin.name}()`,
            new vscode.MarkdownString(builtin.description)
        );

        // パラメータ情報を追加
        if (builtin.signature) {
            const paramMatch = builtin.signature.match(/\((.*?)\)/);
            if (paramMatch) {
                const params = paramMatch[1].split(',').map(p => p.trim());
                signature.parameters = params.map((param, idx) => {
                    return new vscode.ParameterInformation(
                        param,
                        new vscode.MarkdownString(`パラメータ ${idx + 1}`)
                    );
                });
            }
        }

        // 現在のパラメータインデックスを計算
        const fullText = document.getText(new vscode.Range(
            new vscode.Position(position.line, lastOpenParen),
            position
        ));
        const commaCount = (fullText.match(/,/g) || []).length;

        const help = new vscode.SignatureHelp();
        help.signatures = [signature];
        help.activeSignature = 0;
        help.activeParameter = commaCount;

        return help;
    }
}

/**
 * インラインパラメータヒント
 */
export class InlineParameterHintsProvider implements vscode.InlineValuesProvider {
    provideInlineValues(
        document: vscode.TextDocument,
        viewport: vscode.Range,
        context: vscode.InlineValueContext,
        token: vscode.CancellationToken
    ): vscode.InlineValue[] {
        const values: vscode.InlineValue[] = [];
        const text = document.getText(viewport);

        // 関数呼び出しのパターンを見つける
        const functionCallPattern = /(\w+)\s*\(\s*([^)]*)\s*\)/g;
        let match;

        while ((match = functionCallPattern.exec(text)) !== null) {
            const functionName = match[1];
            const argsText = match[2];

            // 組み込み関数を検索
            const builtin = BUILTIN_FUNCTIONS.find(f => f.name === functionName);
            if (!builtin) continue;

            // パラメータ情報を表示
            const args = argsText.split(',').map(a => a.trim());
            if (args.length > 0 && args[0] !== '') {
                const hintText = args.map((arg, idx) => {
                    const paramInfo = builtin.signature
                        ? `${arg}`
                        : `${arg}`;
                    return paramInfo;
                }).join(', ');

                const startPos = document.positionAt(viewport.start.character + match.index + functionName.length + 1);
                values.push(
                    new vscode.InlineValueText(
                        new vscode.Range(startPos, startPos),
                        `// ${builtin.description.substring(0, 50)}...`
                    )
                );
            }
        }

        return values;
    }
}

/**
 * 関数の完全な情報をホバーで表示
 */
export class EnhancedFunctionHoverProvider implements vscode.HoverProvider {
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.Hover | null {
        const range = document.getWordRangeAtPosition(position);
        if (!range) return null;

        const word = document.getText(range);

        // 組み込み関数を検索
        const builtin = BUILTIN_FUNCTIONS.find(f => f.name === word);
        if (!builtin) return null;

        // ホバー情報を作成
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`### \`${builtin.name}\`\n\n`);

        if (builtin.signature) {
            md.appendCodeblock(builtin.signature, 'hajimu');
            md.appendMarkdown('\n\n');
        }

        md.appendMarkdown(`${builtin.description}\n\n`);

        if (builtin.examples && builtin.examples.length > 0) {
            md.appendMarkdown('**使用例:**\n');
            for (const example of builtin.examples) {
                md.appendCodeblock(example, 'hajimu');
            }
        }

        return new vscode.Hover(md, range);
    }
}

/**
 * 改善されたシグネチャヘルプを登録
 */
export function registerEnhancedSignatureHelp(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            'hajimu',
            new EnhancedSignatureHelpProvider(),
            '(',
            ','
        )
    );

    // インラインパラメータヒント（VS Code 1.80+）
    const inlineValuesProvider = new InlineParameterHintsProvider();
    try {
        context.subscriptions.push(
            vscode.languages.registerInlineValuesProvider('hajimu', inlineValuesProvider)
        );
    } catch (e) {
        // InlineValuesProvider がサポートされていない場合はスキップ
    }

    // 改善されたホバープロバイダ
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            'hajimu',
            new EnhancedFunctionHoverProvider()
        )
    );
}
