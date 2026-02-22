import * as vscode from 'vscode';
import { registerCompletionProvider } from './completion';
import { registerHoverProvider } from './hover';
import { registerRunCommands } from './runner';
import { registerDiagnostics } from './diagnostics';
import { registerSymbolProviders } from './symbols';
import { registerSignatureHelp } from './signatureHelp';
import { registerCodeActions } from './codeActions';
import { registerFormatter } from './formatter';

export function activate(context: vscode.ExtensionContext) {
    console.log('はじむ (Hajimu) 拡張機能 v2.0.0 がアクティブになりました');

    // コード補完（プラグイン対応）
    registerCompletionProvider(context);

    // ホバー情報（プラグイン対応）
    registerHoverProvider(context);

    // 実行コマンド
    registerRunCommands(context);

    // 構文エラー検知（リアルタイム診断）
    const diagnostics = registerDiagnostics(context);

    // ドキュメントシンボル & 定義へ移動
    registerSymbolProviders(context);

    // シグネチャヘルプ（パラメータヒント）
    registerSignatureHelp(context);

    // コードアクション（クイックフィックス & リファクタリング）
    registerCodeActions(context);

    // ドキュメントフォーマッタ
    registerFormatter(context);

    // カラープロバイダ（色関数のプレビュー）
    registerColorProvider(context);

    // 折り畳み範囲プロバイダ
    registerFoldingProvider(context);

    // ステータスバー
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(play) はじむ';
    statusBar.tooltip = 'はじむプログラムを実行 (Cmd+Shift+R)';
    statusBar.command = 'hajimu.run';
    context.subscriptions.push(statusBar);

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && editor.document.languageId === 'hajimu') {
                statusBar.show();
            } else {
                statusBar.hide();
            }
        })
    );

    if (vscode.window.activeTextEditor?.document.languageId === 'hajimu') {
        statusBar.show();
    }
}

/**
 * 色関数のカラーピッカー対応
 * 色(r, g, b), 色(r, g, b, a), 色16進("#RRGGBB") をカラーピッカーで表示
 */
function registerColorProvider(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerColorProvider('hajimu', {
            provideDocumentColors(document: vscode.TextDocument): vscode.ColorInformation[] {
                const colors: vscode.ColorInformation[] = [];
                const text = document.getText();

                // 色(r, g, b) / 色(r, g, b, a)
                const rgbPattern = /色\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?))?\s*\)/g;
                let match;
                while ((match = rgbPattern.exec(text)) !== null) {
                    const r = parseInt(match[1]) / 255;
                    const g = parseInt(match[2]) / 255;
                    const b = parseInt(match[3]) / 255;
                    const a = match[4] ? parseFloat(match[4]) : 1.0;
                    const startPos = document.positionAt(match.index);
                    const endPos = document.positionAt(match.index + match[0].length);
                    colors.push(new vscode.ColorInformation(
                        new vscode.Range(startPos, endPos),
                        new vscode.Color(r, g, b, a)
                    ));
                }

                // 色16進("#RRGGBB") / 色16進("#RRGGBBAA")
                const hexPattern = /色16進\(\s*"#([0-9a-fA-F]{6,8})"\s*\)/g;
                while ((match = hexPattern.exec(text)) !== null) {
                    const hex = match[1];
                    const r = parseInt(hex.substring(0, 2), 16) / 255;
                    const g = parseInt(hex.substring(2, 4), 16) / 255;
                    const b = parseInt(hex.substring(4, 6), 16) / 255;
                    const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1.0;
                    const startPos = document.positionAt(match.index);
                    const endPos = document.positionAt(match.index + match[0].length);
                    colors.push(new vscode.ColorInformation(
                        new vscode.Range(startPos, endPos),
                        new vscode.Color(r, g, b, a)
                    ));
                }

                return colors;
            },
            provideColorPresentations(color: vscode.Color, ctx: { document: vscode.TextDocument, range: vscode.Range }): vscode.ColorPresentation[] {
                const r = Math.round(color.red * 255);
                const g = Math.round(color.green * 255);
                const b = Math.round(color.blue * 255);
                const a = color.alpha;

                const presentations: vscode.ColorPresentation[] = [];

                // 色(r, g, b) 形式
                if (a === 1.0) {
                    presentations.push(new vscode.ColorPresentation(`色(${r}, ${g}, ${b})`));
                } else {
                    presentations.push(new vscode.ColorPresentation(`色(${r}, ${g}, ${b}, ${a.toFixed(2)})`));
                }

                // 色16進 形式
                const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                presentations.push(new vscode.ColorPresentation(`色16進("${hex}")`));

                return presentations;
            }
        })
    );
}

/**
 * 折り畳み範囲プロバイダ — ブロック構文の折り畳み
 */
function registerFoldingProvider(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider('hajimu', {
            provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
                const ranges: vscode.FoldingRange[] = [];
                const blockStack: { line: number; kind: vscode.FoldingRangeKind }[] = [];

                const blockOpeners = /^(関数|生成関数|もし|型|試行|選択|照合|列挙|初期化)\b/;

                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i).text;
                    const trimmed = line.replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();

                    if (blockOpeners.test(trimmed) || /繰り返す\s*$/.test(trimmed) || /の間\s*$/.test(trimmed)) {
                        blockStack.push({ line: i, kind: vscode.FoldingRangeKind.Region });
                    } else if (/^終わり\s*$/.test(trimmed) && blockStack.length > 0) {
                        const opener = blockStack.pop()!;
                        if (i > opener.line) {
                            ranges.push(new vscode.FoldingRange(opener.line, i, opener.kind));
                        }
                    }

                    // コメントブロックの折り畳み
                    if (/^(#|\/\/)/.test(trimmed)) {
                        let end = i;
                        while (end + 1 < document.lineCount) {
                            const next = document.lineAt(end + 1).text.trim();
                            if (/^(#|\/\/)/.test(next)) {
                                end++;
                            } else {
                                break;
                            }
                        }
                        if (end > i) {
                            ranges.push(new vscode.FoldingRange(i, end, vscode.FoldingRangeKind.Comment));
                            i = end; // skip
                        }
                    }
                }

                return ranges;
            }
        })
    );
}

export function deactivate() {}
