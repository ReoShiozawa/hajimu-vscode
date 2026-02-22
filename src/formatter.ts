/**
 * ドキュメントフォーマッタ — はじむコードの整形
 */
import * as vscode from 'vscode';

export function registerFormatter(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('hajimu', new HajimuFormattingProvider())
    );
    context.subscriptions.push(
        vscode.languages.registerDocumentRangeFormattingEditProvider('hajimu', new HajimuFormattingProvider())
    );
}

class HajimuFormattingProvider implements vscode.DocumentFormattingEditProvider, vscode.DocumentRangeFormattingEditProvider {
    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions
    ): vscode.TextEdit[] {
        return formatLines(document, 0, document.lineCount - 1, options);
    }

    provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        range: vscode.Range,
        options: vscode.FormattingOptions
    ): vscode.TextEdit[] {
        return formatLines(document, range.start.line, range.end.line, options);
    }
}

function formatLines(
    document: vscode.TextDocument,
    startLine: number,
    endLine: number,
    options: vscode.FormattingOptions
): vscode.TextEdit[] {
    const edits: vscode.TextEdit[] = [];
    const tabStr = options.insertSpaces ? ' '.repeat(options.tabSize) : '\t';
    let indentLevel = 0;

    // startLine より前の行からインデントレベルを推定
    if (startLine > 0) {
        const text = document.getText(new vscode.Range(0, 0, startLine, 0));
        const lines = text.split('\n');
        for (const line of lines) {
            const trimmed = line.replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();
            if (isBlockOpener(trimmed)) { indentLevel++; }
            if (/^終わり\s*$/.test(trimmed) && indentLevel > 0) { indentLevel--; }
        }
    }

    for (let i = startLine; i <= endLine; i++) {
        const line = document.lineAt(i);
        const trimmed = line.text.replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();
        const originalTrimmed = line.text.trim();

        if (originalTrimmed === '') {
            continue; // 空行はそのまま
        }

        // 「終わり」/ 「それ以外」系 / 「捕獲」「最終」「場合」「既定」はインデントを下げてから
        if (isBlockCloserOrMiddle(trimmed)) {
            if (indentLevel > 0) { indentLevel--; }
        }

        const expectedIndent = tabStr.repeat(indentLevel);
        const expectedLine = expectedIndent + originalTrimmed;

        if (line.text !== expectedLine) {
            edits.push(vscode.TextEdit.replace(
                new vscode.Range(i, 0, i, line.text.length),
                expectedLine
            ));
        }

        // 「それ以外もし」「それ以外」「捕獲」「最終」「場合」「既定」は次の行でインデント戻す
        if (isBlockMiddle(trimmed)) {
            indentLevel++;
        }

        // ブロック開始行 → 次の行からインデント上げ
        if (isBlockOpener(trimmed) && !/^終わり/.test(trimmed)) {
            indentLevel++;
        }

        // 「終わり」はそのまま（既にデクリメント済み）
    }

    return edits;
}

function isBlockOpener(trimmed: string): boolean {
    if (/^(関数|生成関数|もし|型|試行|選択|照合|列挙)\b/.test(trimmed) && !/終わり/.test(trimmed)) {
        return true;
    }
    if (/繰り返す\s*$/.test(trimmed)) { return true; }
    if (/の間\s*$/.test(trimmed)) { return true; }
    if (/^初期化\s*\(/.test(trimmed) && /:$/.test(trimmed)) { return true; }
    return false;
}

function isBlockCloserOrMiddle(trimmed: string): boolean {
    return /^(終わり|それ以外もし|それ以外|捕獲|最終|場合|既定)\b/.test(trimmed);
}

function isBlockMiddle(trimmed: string): boolean {
    return /^(それ以外もし|それ以外|捕獲|最終|場合|既定)\b/.test(trimmed);
}
