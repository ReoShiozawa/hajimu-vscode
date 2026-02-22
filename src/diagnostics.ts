/**
 * はじむ構文エラー検知 (Diagnostics)
 *
 * リアルタイムで .jp ファイルの構文エラーを検出し、
 * VS Code の問題パネルに表示する。
 */
import * as vscode from 'vscode';
import { KEYWORDS, BUILTIN_FUNCTIONS } from './languageData';
import { parseImports } from './pluginData';

interface BlockInfo {
    keyword: string;
    line: number;
}

export function registerDiagnostics(context: vscode.ExtensionContext): vscode.DiagnosticCollection {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('hajimu');
    context.subscriptions.push(diagnosticCollection);

    // ドキュメント変更時に更新
    const onChange = vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.languageId === 'hajimu') {
            updateDiagnostics(e.document, diagnosticCollection);
        }
    });

    // ドキュメントを開いた時に更新
    const onOpen = vscode.workspace.onDidOpenTextDocument((doc) => {
        if (doc.languageId === 'hajimu') {
            updateDiagnostics(doc, diagnosticCollection);
        }
    });

    // ドキュメントが閉じた時にクリア
    const onClose = vscode.workspace.onDidCloseTextDocument((doc) => {
        diagnosticCollection.delete(doc.uri);
    });

    context.subscriptions.push(onChange, onOpen, onClose);

    // 既に開いているドキュメントを処理
    vscode.workspace.textDocuments.forEach((doc) => {
        if (doc.languageId === 'hajimu') {
            updateDiagnostics(doc, diagnosticCollection);
        }
    });

    return diagnosticCollection;
}

function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection) {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    checkBlockMatching(lines, diagnostics);
    checkStringLiterals(lines, diagnostics);
    checkParentheses(lines, diagnostics);
    checkBrackets(lines, diagnostics);
    checkCommonErrors(lines, diagnostics);
    checkImportSyntax(lines, diagnostics);

    collection.set(document.uri, diagnostics);
}

/**
 * ブロック開始/終了の対応チェック
 * 関数/もし/型/etc は「終わり」で閉じる必要がある
 */
function checkBlockMatching(lines: string[], diagnostics: vscode.Diagnostic[]) {
    const blockStack: BlockInfo[] = [];
    const blockOpeners = [
        '関数', '生成関数', 'もし', '条件', '型', '試行',
        '選択', '照合', '列挙'
    ];
    // 「繰り返す」は行末キーワード
    // 「なら」行の後は条件分岐ブロック内

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();

        if (trimmed === '' || trimmed.startsWith('/*')) {
            continue;
        }

        // ブロック内のサブキーワードはスタックに影響しない
        if (/^(それ以外もし|それ以外|捕獲|最終|場合|既定)\b/.test(trimmed)) {
            continue;
        }

        // 「繰り返す」で終わる行はブロック開始
        if (/繰り返す\s*$/.test(trimmed)) {
            blockStack.push({ keyword: '繰り返す', line: i });
            continue;
        }

        // 「の間」で終わる行（while）はブロック開始
        if (/の間\s*$/.test(trimmed)) {
            blockStack.push({ keyword: '条件', line: i });
            continue;
        }

        // 「初期化」単独行もブロック開始
        if (/^初期化\s*\(/.test(trimmed) && /:$/.test(trimmed)) {
            blockStack.push({ keyword: '初期化', line: i });
            continue;
        }

        // ブロック開始キーワード
        for (const opener of blockOpeners) {
            if (trimmed.startsWith(opener) && !/終わり/.test(trimmed)) {
                // 「もし A なら ... 終わり」が1行に収まっている場合はスキップ
                if (opener === 'もし' && /終わり/.test(trimmed)) {
                    continue;
                }
                blockStack.push({ keyword: opener, line: i });
                break;
            }
        }

        // 「終わり」キーワード
        if (/^終わり\s*$/.test(trimmed) || trimmed === '終わり') {
            if (blockStack.length === 0) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(i, 0, i, line.length),
                    '対応するブロック開始キーワードがない「終わり」です',
                    vscode.DiagnosticSeverity.Error
                ));
            } else {
                blockStack.pop();
            }
        }
    }

    // 閉じられていないブロック
    for (const block of blockStack) {
        diagnostics.push(new vscode.Diagnostic(
            new vscode.Range(block.line, 0, block.line, lines[block.line].length),
            `「${block.keyword}」に対応する「終わり」がありません`,
            vscode.DiagnosticSeverity.Error
        ));
    }
}

/**
 * 文字列リテラルの閉じ忘れチェック
 */
function checkStringLiterals(lines: string[], diagnostics: vscode.Diagnostic[]) {
    let inTripleQuote = false;
    let tripleQuoteStart = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // トリプルクォートの処理
        if (inTripleQuote) {
            if (line.includes('"""')) {
                inTripleQuote = false;
            }
            continue;
        }

        if (line.includes('"""')) {
            const count = (line.match(/"""/g) || []).length;
            if (count === 1) {
                inTripleQuote = true;
                tripleQuoteStart = i;
            }
            continue;
        }

        // コメント行はスキップ
        const commentIdx = Math.min(
            line.indexOf('//') >= 0 ? line.indexOf('//') : Infinity,
            line.indexOf('#') >= 0 ? line.indexOf('#') : Infinity
        );
        const codePart = commentIdx < Infinity ? line.substring(0, commentIdx) : line;

        // シングルクォートはないので、ダブルクォートのみ
        let inString = false;
        let escaped = false;
        for (let j = 0; j < codePart.length; j++) {
            const ch = codePart[j];
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
            }
        }
        if (inString) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '文字列が閉じられていません（" が不足しています）',
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    if (inTripleQuote && tripleQuoteStart >= 0) {
        diagnostics.push(new vscode.Diagnostic(
            new vscode.Range(tripleQuoteStart, 0, tripleQuoteStart, lines[tripleQuoteStart].length),
            'トリプルクォート文字列が閉じられていません（""" が不足しています）',
            vscode.DiagnosticSeverity.Error
        ));
    }
}

/**
 * 括弧の対応チェック
 */
function checkParentheses(lines: string[], diagnostics: vscode.Diagnostic[]) {
    checkBracketPair(lines, diagnostics, '(', ')', '丸括弧');
}

function checkBrackets(lines: string[], diagnostics: vscode.Diagnostic[]) {
    checkBracketPair(lines, diagnostics, '[', ']', '角括弧');
    checkBracketPair(lines, diagnostics, '{', '}', '波括弧');
}

function checkBracketPair(
    lines: string[],
    diagnostics: vscode.Diagnostic[],
    open: string,
    close: string,
    name: string
) {
    const stack: { line: number; col: number }[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let inString = false;
        let escaped = false;
        let inComment = false;

        for (let j = 0; j < line.length; j++) {
            const ch = line[j];

            if (inComment) { break; }
            if (escaped) { escaped = false; continue; }
            if (ch === '\\') { escaped = true; continue; }

            if (ch === '"' && !inComment) { inString = !inString; continue; }
            if (inString) { continue; }

            if (ch === '/' && j + 1 < line.length && line[j + 1] === '/') { break; }
            if (ch === '#') { break; }

            if (ch === open) {
                stack.push({ line: i, col: j });
            } else if (ch === close) {
                if (stack.length === 0) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(i, j, i, j + 1),
                        `対応する「${open}」がない「${close}」です（${name}）`,
                        vscode.DiagnosticSeverity.Error
                    ));
                } else {
                    stack.pop();
                }
            }
        }
    }

    for (const item of stack) {
        diagnostics.push(new vscode.Diagnostic(
            new vscode.Range(item.line, item.col, item.line, item.col + 1),
            `対応する「${close}」がない「${open}」です（${name}）`,
            vscode.DiagnosticSeverity.Error
        ));
    }
}

/**
 * よくある構文エラーのパターンマッチング
 */
function checkCommonErrors(lines: string[], diagnostics: vscode.Diagnostic[]) {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();

        if (trimmed === '') { continue; }

        // 「もし」に「なら」がない
        if (/^もし\s+/.test(trimmed) && !trimmed.includes('なら') && !trimmed.includes('//')) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '「もし」文に「なら」がありません',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // 「それ以外もし」に「なら」がない
        if (/^それ以外もし\s+/.test(trimmed) && !trimmed.includes('なら')) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '「それ以外もし」文に「なら」がありません',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // 関数定義にコロンがない
        if (/^(関数|生成関数)\s+[\p{L}_][\p{L}\p{N}_]*\s*\([^)]*\)\s*$/u.test(trimmed)) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '関数定義の末尾にコロン「:」がありません',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // 型定義にコロンがない
        if (/^型\s+[\p{L}_][\p{L}\p{N}_]*\s*$/u.test(trimmed)) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '型定義の末尾にコロン「:」がありません',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // 変数/定数宣言に「=」がない
        if (/^(変数|定数)\s+[\p{L}_][\p{L}\p{N}_]*\s*$/u.test(trimmed)) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '変数/定数宣言に代入「=」がありません',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // 「条件」に「の間」がない
        if (/^条件\s+/.test(trimmed) && !trimmed.includes('の間')) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '「条件」文に「の間」がありません',
                vscode.DiagnosticSeverity.Warning
            ));
        }
    }
}

/**
 * 取り込む文の構文チェック
 */
function checkImportSyntax(lines: string[], diagnostics: vscode.Diagnostic[]) {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed.startsWith('取り込む')) {
            // 取り込む("パス") or 取り込む "パス" として 名前
            if (!/^取り込む\s*\(\s*"[^"]*"\s*\)\s*$/.test(trimmed) &&
                !/^取り込む\s+"[^"]+"\s+として\s+[\p{L}\p{N}_]+\s*$/u.test(trimmed) &&
                !/^取り込む\s*\(\s*"[^"]*"\s*\)\s*として\s+[\p{L}\p{N}_]+\s*$/u.test(trimmed)) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(i, 0, i, line.length),
                    '「取り込む」の構文が不正です。取り込む("パス") または 取り込む "パス" として 名前 の形式を使用してください',
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        }
    }
}
