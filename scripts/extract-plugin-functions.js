#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node scripts/extract-plugin-functions.js <plugin-source.c|cpp> [plugin-name]');
  process.exit(1);
}

const sourcePath = process.argv[2];
if (!sourcePath) {
  usage();
}

const absolutePath = path.resolve(process.cwd(), sourcePath);
if (!fs.existsSync(absolutePath)) {
  console.error(`File not found: ${absolutePath}`);
  process.exit(1);
}

const source = fs.readFileSync(absolutePath, 'utf8');
const pluginName = process.argv[3] || inferPluginName(source, absolutePath);
const functions = extractFunctions(source);

const output = {
  pluginName,
  source: sourcePath,
  count: functions.length,
  functions
};

console.log(JSON.stringify(output, null, 2));

function inferPluginName(source, filePath) {
  const explicitName = source.match(/\.name\s*=\s*"([^"]+)"/) || source.match(/"name"\s*:\s*"([^"]+)"/);
  if (explicitName) {
    return explicitName[1];
  }

  const packageDir = filePath.split(path.sep).find(part => part.startsWith('jp-engine_') || part.startsWith('jp-'));
  if (packageDir) {
    return packageDir.replace(/^jp-/, '');
  }

  return path.basename(path.dirname(filePath));
}

function extractFunctions(source) {
  const seen = new Set();
  const functions = [];

  const fnMacro = /FN\(\s*([^,\s)]+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
  collectMatches(fnMacro, source, seen, functions);

  const structLiteral = /\{\s*"([^"]+)"\s*,\s*(?:fn_|p_|hjp_)?[A-Za-z0-9_]+\s*,\s*(\d+)\s*,\s*(\d+)\s*\}/g;
  collectMatches(structLiteral, source, seen, functions);

  return functions.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

function collectMatches(regex, source, seen, functions) {
  let match;
  while ((match = regex.exec(source)) !== null) {
    const name = match[1];
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);

    const minArgs = Number(match[2]);
    const maxArgs = Number(match[3]);
    const args = minArgs === maxArgs ? `${minArgs}` : `${minArgs}-${maxArgs}`;
    functions.push({
      name,
      description: `${name} (${args}引数)`,
      signature: `${name}(...)`,
      category: inferCategory(name),
      minArgs,
      maxArgs
    });
  }
}

function inferCategory(name) {
  if (/ウィンドウ|FPS|カーソル/.test(name)) return 'ウィンドウ';
  if (/キー|マウス|入力|アクション/.test(name)) return '入力';
  if (/描画|テクスチャ|矩形|円|直線|フォント|テキスト|カメラ|レンダー/.test(name)) return '描画';
  if (/音楽|SE|音声|音量|フェード|パン/.test(name)) return '音声';
  if (/物理|ボディ|衝突|タイル|レイキャスト/.test(name)) return '物理';
  if (/キャラ|バトル|アイテム|スキル|パーティ|ノベル|メッセージ|選択肢/.test(name)) return 'RPG';
  if (/エンティティ|コンポーネント|タグ|クエリ|シーン/.test(name)) return 'ECS';
  if (/ログ|VFS|エンジン/.test(name)) return 'システム';
  return 'その他';
}
