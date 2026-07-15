export interface BlockIssue {
    line: number;
    keyword: string;
    kind: 'unexpected-end' | 'missing-end';
}

interface BlockInfo {
    keyword: string;
    line: number;
}

/** 文字列とコメントを空白化し、位置を保ったまま構文だけを取り出す。 */
export function maskCodeLines(lines: string[]): string[] {
    let inBlockComment = false;
    let inTripleQuote = false;

    return lines.map((line) => {
        let result = '';
        let inString = false;
        let escaped = false;

        for (let i = 0; i < line.length; i++) {
            const pair = line.slice(i, i + 2);
            const triple = line.slice(i, i + 3);

            if (inBlockComment) {
                if (pair === '*/') {
                    result += '  ';
                    i++;
                    inBlockComment = false;
                } else {
                    result += ' ';
                }
                continue;
            }
            if (inTripleQuote) {
                if (triple === '"""') {
                    result += '   ';
                    i += 2;
                    inTripleQuote = false;
                } else {
                    result += ' ';
                }
                continue;
            }
            if (!inString && triple === '"""') {
                result += '   ';
                i += 2;
                inTripleQuote = true;
                continue;
            }
            if (!inString && pair === '/*') {
                result += '  ';
                i++;
                inBlockComment = true;
                continue;
            }
            if (!inString && pair === '//') {
                result += ' '.repeat(line.length - i);
                break;
            }
            const ch = line[i];
            if (escaped) {
                result += ' ';
                escaped = false;
            } else if (inString && ch === '\\') {
                result += ' ';
                escaped = true;
            } else if (ch === '"') {
                result += ' ';
                inString = !inString;
            } else {
                result += inString ? ' ' : ch;
            }
        }
        return result.padEnd(line.length, ' ');
    });
}

export function analyzeBlocks(lines: string[]): BlockIssue[] {
    const stack: BlockInfo[] = [];
    const issues: BlockIssue[] = [];
    const maskedLines = maskCodeLines(lines);

    for (let line = 0; line < maskedLines.length; line++) {
        const text = maskedLines[line].trim();
        if (!text) continue;

        if (/^(?:終わり|end)\s*;?$/i.test(text)) {
            const block = stack.pop();
            if (!block) issues.push({ line, keyword: text.replace(/;$/, ''), kind: 'unexpected-end' });
            continue;
        }

        if (/^(?:それ以外(?:もし)?|捕獲|最終|場合|既定)(?:\s|:|$)|^(?:else|elif|catch|finally|case|default)(?:\s|:|$)/i.test(text)) {
            continue;
        }

        const opener = getBlockOpener(text);
        if (opener && !/(?:終わり|\bend)\s*;?$/i.test(text)) {
            stack.push({ keyword: opener, line });
        }
    }

    for (const block of stack) {
        issues.push({ line: block.line, keyword: block.keyword, kind: 'missing-end' });
    }
    return issues;
}

function getBlockOpener(text: string): string | undefined {
    const patterns: Array<[RegExp, string]> = [
        [/^(?:静的\s+)?(?:関数|生成関数)(?:\s|$)/, '関数'],
        [/^型(?:\s|:|$)/, '型'],
        [/^もし(?:\s|:|$)/, 'もし'],
        [/^条件(?:\s|:|$)/, '条件'],
        [/^(?:試行|選択|照合|列挙|各)(?:\s|:|$)/, text.match(/^\S+/)?.[0] || 'ブロック'],
        [/^初期化\s*\(/, '初期化'],
        [/繰り返す\s*:?[;]?$/, '繰り返す'],
        [/の間\s*:?[;]?$/, '条件'],
        [/^(?:static\s+)?(?:function|fn)(?:\s|$)/i, 'function'],
        [/^(?:class|type|if|while|for|try|switch|match|enum)(?:\s|:|\(|$)/i, text.match(/^\S+/)?.[0] || 'block'],
        [/^(?:init|constructor)\s*\(/i, 'constructor']
    ];
    return patterns.find(([pattern]) => pattern.test(text))?.[1];
}

export function isValidImportStatement(text: string): boolean {
    const trimmed = text.trim().replace(/;$/, '');
    return /^(?:取り込む|import|use)\s*(?:\(\s*)?"[^"\n]+"\s*\)?(?:\s+(?:として|as)\s+[\p{L}_][\p{L}\p{N}_]*)?$/iu.test(trimmed);
}

const FULLWIDTH_SYMBOLS: Record<string, string> = {
    '（': '(', '）': ')', '［': '[', '］': ']', '｛': '{', '｝': '}',
    '，': ',', '：': ':', '；': ';', '＝': '=', '＋': '+', '－': '-',
    '＊': '*', '／': '/', '％': '%', '＜': '<', '＞': '>', '！': '!',
    '＆': '&', '｜': '|', '．': '.', '　': ' '
};

/** IMEが入力した全角記号をコード領域だけASCIIへ戻す。 */
export function normalizeFullWidthCode(text: string): string {
    let result = '';
    let inString = false;
    let inLineComment = false;
    let inBlockComment = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const pair = text.slice(i, i + 2);
        if (ch === '\n') inLineComment = false;
        if (!inString && !inLineComment && pair === '/*') inBlockComment = true;
        if (inBlockComment && pair === '*/') {
            result += pair;
            i++;
            inBlockComment = false;
            continue;
        }
        if (!inString && !inBlockComment && pair === '//') inLineComment = true;

        if (!inLineComment && !inBlockComment) {
            if (!inString && (ch === '「' || ch === '『' || ch === '“' || ch === '＂')) {
                result += '"';
                inString = true;
                continue;
            }
            if (inString && !escaped && (ch === '」' || ch === '』' || ch === '”' || ch === '＂')) {
                result += '"';
                inString = false;
                continue;
            }
            if (ch === '"' && !escaped) inString = !inString;
            const codePoint = ch.charCodeAt(0);
            if (!inString && codePoint >= 0xFF01 && codePoint <= 0xFF5E) {
                result += String.fromCharCode(codePoint - 0xFEE0);
                continue;
            }
            if (!inString && FULLWIDTH_SYMBOLS[ch]) {
                result += FULLWIDTH_SYMBOLS[ch];
                continue;
            }
        }
        result += ch;
        escaped = inString && ch === '\\' && !escaped;
        if (ch !== '\\') escaped = false;
    }
    return result;
}
