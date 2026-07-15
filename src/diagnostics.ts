/**
 * はじむ構文エラー検知 (Diagnostics)
 *
 * リアルタイムで .jp ファイルの構文エラーを検出し、
 * VS Code の問題パネルに表示する。
 */
import * as vscode from 'vscode';
import { KEYWORDS, BUILTIN_FUNCTIONS } from './languageData';
import { parseImports, PLUGINS } from './pluginData';
import { getHajimuDiagnosticsConfig } from './config';
import { analyzeBlocks, isValidImportStatement, maskCodeLines } from './syntaxAnalysis';

export function registerDiagnostics(context: vscode.ExtensionContext): vscode.DiagnosticCollection {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('hajimu');
    context.subscriptions.push(diagnosticCollection);

    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const scheduleUpdate = (document: vscode.TextDocument, immediate = false) => {
        const key = document.uri.toString();
        const previous = timers.get(key);
        if (previous) clearTimeout(previous);
        const config = vscode.workspace.getConfiguration('hajimu', document.uri);
        if (!config.get('diagnostics.enabled', true)) {
            diagnosticCollection.delete(document.uri);
            return;
        }
        const delay = immediate ? 0 : Math.max(0, config.get('diagnostics.delay', 500));
        timers.set(key, setTimeout(() => {
            timers.delete(key);
            updateDiagnostics(document, diagnosticCollection);
        }, delay));
    };

    // IME変換中の一時的な未完成構文へ波線を出さないよう遅延する。
    const onChange = vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.languageId === 'hajimu') {
            scheduleUpdate(e.document);
        }
    });

    // ドキュメントを開いた時に更新
    const onOpen = vscode.workspace.onDidOpenTextDocument((doc) => {
        if (doc.languageId === 'hajimu') {
            scheduleUpdate(doc, true);
        }
    });

    // ドキュメントが閉じた時にクリア
    const onClose = vscode.workspace.onDidCloseTextDocument((doc) => {
        const key = doc.uri.toString();
        const timer = timers.get(key);
        if (timer) clearTimeout(timer);
        timers.delete(key);
        diagnosticCollection.delete(doc.uri);
    });

    const onConfig = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('hajimu.diagnostics')) {
            vscode.workspace.textDocuments.forEach(doc => {
                if (doc.languageId === 'hajimu') scheduleUpdate(doc, true);
            });
        }
    });

    context.subscriptions.push(onChange, onOpen, onClose, onConfig, {
        dispose: () => timers.forEach(timer => clearTimeout(timer))
    });

    // 既に開いているドキュメントを処理
    vscode.workspace.textDocuments.forEach((doc) => {
        if (doc.languageId === 'hajimu') {
            scheduleUpdate(doc, true);
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
    checkCallAndAccessSyntax(lines, diagnostics);
    checkMissingPluginImports(text, lines, diagnostics);
    checkUndefinedIdentifiers(document, lines, diagnostics);

    collection.set(document.uri, diagnostics);
}

/**
 * ブロック開始/終了の対応チェック
 * 関数/もし/型/etc は「終わり」で閉じる必要がある
 */
function checkBlockMatching(lines: string[], diagnostics: vscode.Diagnostic[]) {
    for (const block of analyzeBlocks(lines)) {
        const line = lines[block.line];
        diagnostics.push(new vscode.Diagnostic(
            new vscode.Range(block.line, 0, block.line, line.length),
            block.kind === 'unexpected-end'
                ? '対応する開始行がないブロック終了です。不要な「終わり」または「end」を削除してください'
                : `「${block.keyword}」に対応するブロック終了がありません。最後に「終わり」または「end」を追加してください`,
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

        // 文字列コンテキストを尊重しながらスキャン
        // # はカラーコードや ImGui ID に使われるためコメント扱いしない
        // // のみ行コメントとして扱う
        let inString = false;
        let escaped = false;
        for (let j = 0; j < line.length; j++) {
            const ch = line[j];
            if (escaped) { escaped = false; continue; }
            if (ch === '\\') { escaped = true; continue; }
            if (ch === '"') {
                inString = !inString;
                continue;
            }
            if (!inString && ch === '/' && j + 1 < line.length && line[j + 1] === '/') {
                break; // コメント開始 → 残りは無視
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
    const maskedLines = maskCodeLines(lines);

    for (let i = 0; i < maskedLines.length; i++) {
        const line = maskedLines[i];

        for (let j = 0; j < line.length; j++) {
            const ch = line[j];

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
    const maskedLines = maskCodeLines(lines);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = maskedLines[i].trim();

        if (trimmed === '') { continue; }

        // 「もし」に「なら」がない
        if (/^もし\s+/.test(trimmed) && !trimmed.includes('なら') && !trimmed.includes('//')) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '「もし」文に「なら」がありません。例: もし 条件 なら',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // 「それ以外もし」に「なら」がない
        if (/^それ以外もし\s+/.test(trimmed) && !trimmed.includes('なら')) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '「それ以外もし」文に「なら」がありません。例: それ以外もし 条件 なら',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // 関数定義にコロンがない
        if (/^(関数|生成関数)\s+[\p{L}_][\p{L}\p{N}_]*\s*\([^)]*\)\s*$/u.test(trimmed)) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '関数定義の末尾にコロン「:」がありません。例: 関数 名前(引数):',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // 型定義にコロンがない
        if (/^型\s+[\p{L}_][\p{L}\p{N}_]*\s*$/u.test(trimmed)) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '型定義の末尾にコロン「:」がありません。例: 型 名前:',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // 変数/定数宣言に「=」がない
        if (/^(変数|定数)\s+[\p{L}_][\p{L}\p{N}_]*\s*$/u.test(trimmed)) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '変数/定数宣言に代入「=」がありません。例: 変数 名前 = 値',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // 「条件」に「の間」がない
        if (/^条件\s+/.test(trimmed) && !trimmed.includes('の間')) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, line.length),
                '「条件」文に「の間」がありません。例: 条件 x < 10 の間',
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

        if (/^(?:取り込む|import|use)(?:\s|\()/iu.test(trimmed)) {
            if (!isValidImportStatement(trimmed)) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(i, 0, i, line.length),
                    '取り込み構文が不正です。例: 取り込む "パス" として 名前 / import "path" as name',
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        }
    }
}

/**
 * 「戻す」と「返す」が混在している時の説明。
 * どちらも値を返す意図だが、ドキュメント・補完では「戻す」を主表記にしている。
 */
function checkReturnAliasConsistency(lines: string[], diagnostics: vscode.Diagnostic[]) {
    const hasModosu = lines.some(line => containsWord(maskStringsAndComments(line), '戻す'));
    const hasKaesu = lines.some(line => containsWord(maskStringsAndComments(line), '返す'));

    if (!hasModosu || !hasKaesu) {
        return;
    }

    for (let i = 0; i < lines.length; i++) {
        const masked = maskStringsAndComments(lines[i]);
        const regex = /返す/gu;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(masked)) !== null) {
            const index = match.index;
            if (!isWordBoundary(masked, index, index + '返す'.length)) {
                continue;
            }

            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, index, i, index + '返す'.length),
                '「返す」は「戻す」の別名です。同じファイル内では主表記の「戻す」に統一すると読みやすくなります',
                vscode.DiagnosticSeverity.Information
            ));
        }
    }
}

/**
 * よくあるアクセス・呼び出し記法の補助診断。
 */
function checkCallAndAccessSyntax(lines: string[], diagnostics: vscode.Diagnostic[]) {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const masked = maskStringsAndComments(line);
        const trimmed = masked.trim();

        if (trimmed === '') {
            continue;
        }

        const bareCall = masked.match(/^(\s*)(表示|文字列化|数値化|長さ|入力|読み込む|書き込む)\s+(.+)$/u);
        if (bareCall && !bareCall[3].trimStart().startsWith('(')) {
            const nameStart = bareCall[1].length;
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, nameStart, i, line.length),
                `関数呼び出しは「${bareCall[2]}(...)」の形で書きます。例: ${bareCall[2]}(${bareCall[3].trim()})`,
                vscode.DiagnosticSeverity.Warning
            ));
        }

    }
}

/**
 * GUI.ボタン のようなプラグインエイリアス利用に対して、取り込む候補を出す。
 */
function checkMissingPluginImports(text: string, lines: string[], diagnostics: vscode.Diagnostic[]) {
    const importedAliases = new Set(parseImports(text).keys());
    const reported = new Set<string>();
    const pluginAliases = getPluginImportAliases();

    for (let i = 0; i < lines.length; i++) {
        const masked = maskStringsAndComments(lines[i]);

        for (const [alias, plugin] of pluginAliases.entries()) {
            if (importedAliases.has(alias)) {
                continue;
            }

            const escapedAlias = escapeRegExp(alias);
            const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])(${escapedAlias})(?:\\.|\\s*\\[\\s*")`, 'u');
            const match = masked.match(regex);
            if (!match || match.index === undefined) {
                continue;
            }

            const start = match.index + match[1].length;
            if (reported.has(alias)) {
                continue;
            }
            reported.add(alias);

            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(i, start, i, start + alias.length),
                `「${alias}」を使うにはプラグインの取り込みが必要です。import候補: 取り込む "${plugin.pluginName}" として ${alias}`,
                vscode.DiagnosticSeverity.Warning
            ));
        }
    }
}

/**
 * 未定義識別子のゆるい検出。
 * 実行前の補助なので、誤診断を避けるため Warning に留める。
 */
function checkUndefinedIdentifiers(
    document: vscode.TextDocument,
    lines: string[],
    diagnostics: vscode.Diagnostic[]
) {
    const config = getHajimuDiagnosticsConfig(document.uri);
    if (!config.undefinedIdentifiers) {
        return;
    }

    const text = document.getText();
    const symbols = collectKnownSymbols(text);
    const candidates = [...symbols.suggestable];
    const reported = new Set<string>();

    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
        const line = lines[lineNo];
        const masked = maskStringsAndComments(line);
        const trimmed = masked.trim();

        if (trimmed === '' || isDefinitionLine(trimmed) || trimmed.startsWith('取り込む')) {
            continue;
        }

        const identifierRegex = /[\p{L}_][\p{L}\p{N}_]*/gu;
        let match: RegExpExecArray | null;
        while ((match = identifierRegex.exec(masked)) !== null) {
            const name = match[0];
            const start = match.index;
            const end = start + name.length;

            if (shouldSkipIdentifier(masked, name, start, end, symbols.known)) {
                continue;
            }

            const reportKey = `${lineNo}:${start}:${name}`;
            if (reported.has(reportKey)) {
                continue;
            }
            reported.add(reportKey);

            const suggestions = findClosestSymbols(name, candidates, 3);
            const suffix = suggestions.length > 0
                ? `。もしかして: ${suggestions.map(s => `「${s}」`).join('、')}`
                : '';
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(lineNo, start, lineNo, end),
                `「${name}」は未定義の可能性があります${suffix}`,
                vscode.DiagnosticSeverity.Warning
            ));
        }
    }
}

interface KnownSymbols {
    known: Set<string>;
    suggestable: Set<string>;
}

function collectKnownSymbols(text: string): KnownSymbols {
    const known = new Set<string>();
    const suggestable = new Set<string>();

    const add = (name: string, suggest = true) => {
        if (!name || /^\d/.test(name)) {
            return;
        }
        known.add(name);
        if (suggest) {
            suggestable.add(name);
        }
    };

    for (const kw of KEYWORDS) {
        add(kw.name);
    }
    for (const fn of BUILTIN_FUNCTIONS) {
        add(fn.name);
    }

    const grammarWords = [
        '数値', '文字列', '真偽', '配列', '辞書', '関数', '無',
        'の', '間', '中', 'で', 'として', 'は', 'に', 'まで'
    ];
    for (const grammarWord of grammarWords) {
        add(grammarWord, false);
    }

    for (const plugin of PLUGINS) {
        add(plugin.pluginName);
        add(plugin.displayName);
        for (const alias of plugin.commonAliases) {
            add(alias);
        }
        for (const fn of plugin.functions) {
            add(fn.name);
        }
    }

    for (const [alias] of parseImports(text).entries()) {
        add(alias);
    }

    const directDeclarationPatterns = [
        /(?:変数|定数)\s+([\p{L}_][\p{L}\p{N}_]*)/gu,
        /型\s+([\p{L}_][\p{L}\p{N}_]*)/gu,
        /捕獲\s+([\p{L}_][\p{L}\p{N}_]*)/gu,
        /([\p{L}_][\p{L}\p{N}_]*)\s+を\s+.+?\s+から\s+.+?\s+繰り返す/gu,
        /.+?\s+を\s+([\p{L}_][\p{L}\p{N}_]*)\s+で繰り返す/gu,
        /^\s*([\p{L}_][\p{L}\p{N}_]*)\s*=/gmu
    ];

    for (const pattern of directDeclarationPatterns) {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(text)) !== null) {
            add(match[1]);
        }
    }

    const functionPattern = /(?:関数|生成関数)\s+([\p{L}_][\p{L}\p{N}_]*)\s*\(([^)]*)\)/gu;
    let functionMatch: RegExpExecArray | null;
    while ((functionMatch = functionPattern.exec(text)) !== null) {
        add(functionMatch[1]);
        addParameterList(functionMatch[2], add);
    }

    const initializerPattern = /初期化\s*\(([^)]*)\)/gu;
    let initializerMatch: RegExpExecArray | null;
    while ((initializerMatch = initializerPattern.exec(text)) !== null) {
        addParameterList(initializerMatch[1], add);
    }

    const eachPattern = /各\s+(.+?)\s+を\s+.+?\s+の中/gu;
    let eachMatch: RegExpExecArray | null;
    while ((eachMatch = eachPattern.exec(text)) !== null) {
        addParameterList(eachMatch[1], add);
    }

    // メソッド定義: クラス内の「名前(...):」形式。呼び出し側の候補としてだけ使う。
    const methodPattern = /^\s+([\p{L}_][\p{L}\p{N}_]*)\s*\(([^)]*)\)\s*:/gmu;
    let methodMatch: RegExpExecArray | null;
    while ((methodMatch = methodPattern.exec(text)) !== null) {
        add(methodMatch[1]);
        addParameterList(methodMatch[2], add);
    }

    return { known, suggestable };
}

function addParameterList(params: string, add: (name: string, suggest?: boolean) => void) {
    for (const rawParam of params.split(',')) {
        const cleaned = rawParam
            .replace(/\*.*/, value => value.replace('*', ''))
            .split('=')[0]
            .split(/\s+は\s+/)[0]
            .trim();
        const match = cleaned.match(/^[\p{L}_][\p{L}\p{N}_]*/u);
        if (match) {
            add(match[0]);
        }
    }
}

function isDefinitionLine(trimmed: string): boolean {
    return /^(関数|生成関数|型|初期化|変数|定数)\b/u.test(trimmed);
}

function shouldSkipIdentifier(
    line: string,
    name: string,
    start: number,
    end: number,
    known: Set<string>
): boolean {
    if (known.has(name)) {
        return true;
    }

    if (/^[A-Z_][A-Z0-9_]*$/.test(name)) {
        return true;
    }

    const before = line[start - 1] || '';
    const after = line[end] || '';

    // プラグイン関数やメンバーアクセスの右側: GUI.ボタン / 自分.名前
    if (before === '.') {
        return true;
    }

    // 関数定義やメソッド定義の名前は別途収集済み。ここでは呼び出しの括弧は診断対象。
    // 辞書キー風の裸識別子は一旦許容: {名前: 値}
    if (after === ':') {
        return true;
    }

    // 取り込みパスや文字列内は mask 済みだが、念のため空白化された領域は除外。
    if (name.trim() === '') {
        return true;
    }

    // 代入左辺は collectKnownSymbols で定義扱いにするため、ここでは除外。
    const rest = line.slice(end);
    if (/^\s*=/.test(rest)) {
        return true;
    }

    return false;
}

function maskStringsAndComments(line: string): string {
    let result = '';
    let inString = false;
    let escaped = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        const next = line[i + 1];

        if (!inString && ch === '/' && next === '/') {
            result += ' '.repeat(line.length - i);
            break;
        }

        if (escaped) {
            result += ' ';
            escaped = false;
            continue;
        }

        if (ch === '\\') {
            result += inString ? ' ' : ch;
            escaped = inString;
            continue;
        }

        if (ch === '"') {
            inString = !inString;
            result += ' ';
            continue;
        }

        result += inString ? ' ' : ch;
    }

    return result;
}

function findClosestSymbols(name: string, candidates: string[], maxResults: number): string[] {
    return candidates
        .filter(candidate => candidate !== name && Math.abs(candidate.length - name.length) <= 6)
        .map(candidate => ({
            candidate,
            distance: levenshtein(name, candidate)
        }))
        .filter(item => item.distance <= Math.max(2, Math.ceil(name.length / 2)))
        .sort((a, b) => a.distance - b.distance || a.candidate.length - b.candidate.length)
        .slice(0, maxResults)
        .map(item => item.candidate);
}

function containsWord(line: string, word: string): boolean {
    let index = line.indexOf(word);
    while (index !== -1) {
        if (isWordBoundary(line, index, index + word.length)) {
            return true;
        }
        index = line.indexOf(word, index + word.length);
    }
    return false;
}

function isWordBoundary(line: string, start: number, end: number): boolean {
    const before = line[start - 1] || '';
    const after = line[end] || '';
    return !/[\p{L}\p{N}_]/u.test(before) && !/[\p{L}\p{N}_]/u.test(after);
}

function getPluginImportAliases(): Map<string, typeof PLUGINS[number]> {
    const aliases = new Map<string, typeof PLUGINS[number]>();

    for (const plugin of PLUGINS) {
        const names = [plugin.displayName, ...plugin.commonAliases];
        for (const alias of names) {
            const current = aliases.get(alias);
            if (!current || plugin.displayName === alias) {
                aliases.set(alias, plugin);
            }
        }
    }

    return aliases;
}

function levenshtein(a: string, b: string): number {
    const aa = Array.from(a);
    const bb = Array.from(b);
    const dp: number[][] = Array.from({ length: aa.length + 1 }, () => Array(bb.length + 1).fill(0));

    for (let i = 0; i <= aa.length; i++) {
        dp[i][0] = i;
    }
    for (let j = 0; j <= bb.length; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= aa.length; i++) {
        for (let j = 1; j <= bb.length; j++) {
            const cost = aa[i - 1] === bb[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }

    return dp[aa.length][bb.length];
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
