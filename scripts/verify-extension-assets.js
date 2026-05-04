#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checks = [];

check('snippets/hajimu.json is valid JSON', () => {
  JSON.parse(read('snippets/hajimu.json'));
});

check('test_all_features.jp does not use old sample syntax', () => {
  const text = read('test_all_features.jp');
  assert(!/^\s*使う\s/m.test(text), 'found old import keyword: 使う');
  assert(!/^\s*書く\s*\(/m.test(text), 'found old print function: 書く');
  assert(!/^\s*ループ\b/m.test(text), 'found old loop keyword: ループ');
});

check('test_all_features.jp includes current roadmap features', () => {
  const text = read('test_all_features.jp');
  for (const needle of [
    '取り込む "engine_render" として 描画',
    '取り込む "engine_audio" として 音声',
    '描画.ウィンドウ幅()',
    'Phase 1: ローマ字・英語入力補助',
    'Phase 7: 仕上げ確認'
  ]) {
    assert(text.includes(needle), `missing ${needle}`);
  }
});

check('engine plugin data is split from pluginData.ts', () => {
  const pluginData = read('src/pluginData.ts');
  const engineData = read('src/pluginDataEngine.ts');
  assert(pluginData.includes("import { ENGINE_PLUGINS } from './pluginDataEngine';"), 'pluginData.ts does not import ENGINE_PLUGINS');
  assert(pluginData.includes('...ENGINE_PLUGINS'), 'PLUGINS does not include ENGINE_PLUGINS spread');
  assert(engineData.includes('engine_render'), 'pluginDataEngine.ts missing engine_render');
  assert(engineData.includes('engine_audio'), 'pluginDataEngine.ts missing engine_audio');
});

check('learning commands are contributed', () => {
  const pkg = JSON.parse(read('package.json'));
  const commands = new Set(pkg.contributes.commands.map(command => command.command));
  for (const command of [
    'hajimu.explainSelectedCode',
    'hajimu.improveSelectedCode',
    'hajimu.explainDiagnosticsAtCursor',
    'hajimu.explainEnglishConcepts',
    'hajimu.startFromSample'
  ]) {
    assert(commands.has(command), `missing command ${command}`);
  }
});

check('extension test plan is documented', () => {
  const text = read('EXTENSION_TEST_PLAN.md');
  for (const needle of [
    '@vscode/test-electron',
    'npm run verify:assets',
    'test_all_features.jp'
  ]) {
    assert(text.includes(needle), `missing ${needle}`);
  }
});

check('plugin extraction script can see engine_audio functions', () => {
  const script = read('scripts/extract-plugin-functions.js');
  assert(script.includes('FN\\(') || script.includes('FN('), 'extract script missing FN support');
  assert(script.includes('inferCategory'), 'extract script missing category inference');
});

check('Kaname key files are covered by plugin aliases', () => {
  const kanameRoot = path.resolve(root, '..', 'kaname');
  if (!fs.existsSync(kanameRoot)) {
    return;
  }

  const deploy = fs.readFileSync(path.join(kanameRoot, 'src/runtime/デプロイ.jp'), 'utf8');
  for (const needle of [
    'engine_render',
    'engine_2d',
    'engine_rpg',
    'engine_audio',
    'として 描画',
    'として 音声'
  ]) {
    assert(deploy.includes(needle), `Kaname deploy sample missing ${needle}`);
  }
});

check('representative external samples use supported import style', () => {
  const samplePaths = [
    path.resolve(root, '..', 'jp-discord/examples/hello_bot.jp'),
    path.resolve(root, '..', 'jp-examples/06_Web開発（hajimu_web）/01_hello_server.jp'),
    path.resolve(root, '..', 'jp-examples/08_GUI開発（hajimu_gui）/01_hello_gui.jp')
  ].filter(samplePath => fs.existsSync(samplePath));

  for (const samplePath of samplePaths) {
    const text = fs.readFileSync(samplePath, 'utf8');
    const hasSupportedImport = /取り込む\s*(?:\(\s*)?"[^"]+"(?:\s*\))?\s+として\s+[\p{L}\p{N}_]+/u.test(text);
    const isSelfContainedSimulation = !/^\s*取り込む/m.test(text) && /シミュレート|シミュレーター/.test(text);
    assert(hasSupportedImport || isSelfContainedSimulation, `${samplePath} has no supported import alias`);
  }
});

let failed = 0;
for (const result of checks) {
  if (result.error) {
    failed++;
    console.error(`not ok - ${result.name}`);
    console.error(`  ${result.error.message}`);
  } else {
    console.log(`ok - ${result.name}`);
  }
}

if (failed > 0) {
  process.exit(1);
}

function check(name, fn) {
  try {
    fn();
    checks.push({ name });
  } catch (error) {
    checks.push({ name, error });
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
