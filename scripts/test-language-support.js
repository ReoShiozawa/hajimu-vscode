const assert = require('node:assert/strict');
const {
    analyzeBlocks,
    isValidImportStatement,
    maskCodeLines,
    normalizeFullWidthCode
} = require('../out/syntaxAnalysis');

assert.deepEqual(
    analyzeBlocks(['変数 選択肢 = 1', '変数 条件値 = 真', '変数 関数一覧 = []']),
    [],
    'キーワードを含む識別子をブロック開始と誤認しない'
);

assert.deepEqual(analyzeBlocks([
    '関数 挨拶(名前):',
    '    もし 名前 != "" なら',
    '        表示(名前)',
    '    終わり',
    '終わり',
    'function greet(name):',
    '    if (name):',
    '        print(name)',
    '    end',
    'end'
]), [], '日本語と英語のブロックを同時に追跡できる');

assert.equal(analyzeBlocks(['もし 真 なら']).at(0)?.kind, 'missing-end');
assert.equal(analyzeBlocks(['終わり']).at(0)?.kind, 'unexpected-end');

for (const statement of [
    '取り込む "hajimu_web"',
    '取り込む("hajimu_web")',
    '取り込む "hajimu_web" として Web',
    'import "hajimu_web"',
    'import "hajimu_web" as Web'
]) {
    assert.equal(isValidImportStatement(statement), true, `${statement} は有効`);
}
assert.equal(isValidImportStatement('取り込む hajimu_web'), false);

const masked = maskCodeLines(['表示(', '    "(/* 文字列 */)", // ]', '    値', ')']);
assert.equal(masked[1].includes(']'), false, '文字列・コメント内の括弧を隠す');

assert.equal(
    normalizeFullWidthCode('もし（値＝＝１）なら：\n    表示（「こんにちは」） // （説明）'),
    'もし(値==1)なら:\n    表示("こんにちは") // （説明）'
);
assert.equal(normalizeFullWidthCode('表示("（そのまま）")'), '表示("（そのまま）")');

console.log('language support tests: passed');
