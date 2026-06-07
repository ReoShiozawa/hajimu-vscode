# VS Code Extension Test 導入メモ

## 目的

手動確認だけでは見落としやすい補完・ホバー・診断・Quick Fix の退行を、自動テストで検出する。

## 最初に自動化する項目

- `test_all_features.jp` を開いて診断が大量発生しないこと
- `kansu` / `function` に対して日本語キーワード補完が出ること
- `描画.` と `描画["` に対して `engine_render` の関数補完が出ること
- `関数` / `表示` のホバーに英語圏用語が含まれること
- `もし 条件` に `なら` Quick Fix が出ること
- 未取り込みの `描画.ウィンドウ幅()` に import Quick Fix が出ること

## 推奨構成

- `@vscode/test-electron` を devDependency に追加
- `src/test/suite/*.test.ts` に Mocha テストを置く
- `testFixture/` に小さな `.jp` ファイルを置く
- CI では `npm run compile`、`npm run verify:assets`、`npm run test:extension` の順に実行する

## 現時点の代替

今は軽量な退行検知として `npm run verify:assets` を用意している。拡張 API を直接叩くテストは、次のリリース準備で追加する。
