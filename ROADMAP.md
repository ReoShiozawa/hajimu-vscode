# はじむ VS Code 拡張 改善ロードマップ

このロードマップは、はじむを「日本語で書けるが、英語圏のプログラミング言語の形にも自然につながる言語」として磨くための VS Code 拡張実装計画です。

主な狙いは次の4つです。

- 日本語キーワード入力の摩擦を減らす
- エラーと修正体験を初心者に優しくする
- はじむの日本語 API と英語圏プログラミング概念を橋渡しする
- 公式プラグイン群と補完・ホバー・診断を同期しやすくする

## Phase 0: 基盤整理

目的: 既存機能を壊さず、以後の拡張を入れやすい形にする。

進捗: 完了。共通入力データ、英語概念語、言語データ索引、設定取得ヘルパー、プラグインデータ分割まで実装済み。

### 実装項目

- [x] `package.json` と `src/extension.ts` の表示バージョンを同期する
- [x] `languageData.ts` に入力展開と英語対応語の共通データを追加する
- [x] ローマ字入力、英語エイリアス、短縮名を同じデータ源から引けるようにする
- [x] `languageData.ts` のキーワード、組み込み関数全体をさらに構造化する
- [x] `pluginData.ts` のプラグイン API データを、将来的に外部JSON生成へ移せる形に分離する
- [x] 設定項目の命名規則を整理する

### 主な対象ファイル

- `src/languageData.ts`
- `src/pluginData.ts`
- `src/extension.ts`
- `package.json`

### 完了条件

- TypeScriptビルドが通る
- 既存の補完、ホバー、診断、実行コマンドが退行しない
- 後続Phaseで使う共通データ型が用意されている

## Phase 1: ローマ字入力展開

目的: コードは日本語のまま、入力速度を英語系言語に近づける。

進捗: 完了。補完方式、任意スペース展開、コメント/文字列/識別子途中での抑制を実装済み。

### 実装項目

- [x] `kansu` -> `関数`、`moshi` -> `もし`、`hensuu` -> `変数` のようなローマ字補完を追加
- [x] `hyouji` / `hyoji` など、よく揺れる表記の別名を許可する
- [x] 補完候補には「ローマ字 -> 日本語キーワード」と分かる説明を付ける
- [x] `Tab` または `Enter` で展開する安全な補完方式を先に実装する
- [x] 設定でスペース入力時の自動展開を切り替えられるようにする
- [x] 文字列内、コメント内では補完・自動展開を抑制する
- [x] 既存識別子の途中での候補表示をさらに抑制する

### 初期対応候補

| ローマ字 | 展開後 |
|---|---|
| `kansu`, `func` | `関数` |
| `hensuu`, `var` | `変数` |
| `teisuu`, `const` | `定数` |
| `moshi`, `if` | `もし` |
| `soreigai`, `else` | `それ以外` |
| `modosu`, `kaesu`, `return` | `戻す` |
| `owari`, `end` | `終わり` |
| `torikomu`, `import` | `取り込む` |
| `hyouji`, `hyoji`, `print` | `表示` |
| `kurikaesu`, `loop` | `繰り返す` |

### 追加設定案

```json
{
  "hajimu.romajiExpansion.enabled": true,
  "hajimu.romajiExpansion.autoExpandOnSpace": false,
  "hajimu.romajiExpansion.includeEnglishAliases": true
}
```

### 主な対象ファイル

- `src/completion.ts`
- `src/aliasExpander.ts`
- `src/snippetCompletion.ts`
- `src/languageData.ts`
- `package.json`

### 完了条件

- `kansu<Tab>` で `関数` に展開される
- 自動展開ON時もコメント・文字列内では暴発しない
- ユーザー設定で機能を無効化できる

## Phase 2: 日本語エラー体験の強化

目的: エラーを「怒られる表示」ではなく「直せる説明」にする。

進捗: 診断メッセージ、未定義識別子サジェスト、プラグインimport候補、一部Quick Fix候補を改善済み。

### 実装項目

- [x] ブロック対応エラーで、開始行と不足している `終わり` の説明を表示する
- [x] よくある構文ミスに修正例を出す
- [x] `戻す` / `返す` の混在、`取り込む(...)` と `取り込む "..."` の違いなどを説明する
- [x] 未定義識別子に対して、近い関数名・キーワード・プラグイン関数名を提案する
- [x] 辞書アクセス、配列アクセス、関数呼び出しの括弧不足を個別に診断する
- [x] Quick Fix で `終わり` の挿入、キーワード修正の候補を出す
- [x] import候補追加を出す

### 主な対象ファイル

- `src/diagnostics.ts`
- `src/indentationDiagnostics.ts`
- `src/codeActions.ts`
- `src/quickFixExtended.ts`
- `src/languageData.ts`

### 完了条件

- 代表的な初心者ミスに対して、原因・修正方法・Quick Fix が出る
- 問題パネルの文言が日本語として自然
- 既存の診断と重複しすぎない

## Phase 3: 英語圏概念への橋渡し

目的: はじむで学んだ知識を Python / JavaScript / C 系の知識に接続する。

進捗: ホバーの英語対応語と、選択範囲を英語圏用語で説明するMarkdown生成コマンドを実装済み。

### 実装項目

- [x] ホバーに英語対応語を表示する
- [x] 例: `関数` のホバーに `function / def / method` を表示
- [x] 主要組み込み関数に英語概念タグを付ける
- [x] コマンド「はじむ: この構文を英語圏言語の用語で説明」を追加する
- [x] 選択範囲のコードに対して、概念説明をWebViewまたはMarkdownで表示する
- [x] `Pythonならこう`, `JavaScriptならこう` の短い対応例を用意する

### 主な対象ファイル

- `src/hover.ts`
- `src/enhancedSignatureHelp.ts`
- `src/documentationTools.ts`
- `src/languageData.ts`
- `package.json`

### 完了条件

- キーワード・主要組み込み関数のホバーに英語対応語が出る
- 初心者が検索に使える英語キーワードを知れる
- 説明が長すぎず、実装時の邪魔にならない

## Phase 4: 学習支援コマンド

目的: VS Code 拡張を単なる言語支援ではなく、はじむ学習環境に近づける。

進捗: 選択コード説明、コード改善メモ、エラー行説明、英語圏用語説明、サンプルから開始を実装済み。

### 実装項目

- [x] コマンド「はじむ: 選択コードを説明」を追加
- [x] コマンド「はじむ: このコードを改善」を追加
- [x] コマンド「はじむ: サンプルから開始」を追加
- [x] 文法カテゴリ別のサンプル挿入メニューを作る
- [x] エラーが出ている行に対して、修正候補を説明付きで表示する
- [x] Web / GUI / Discord / ゲーム向けテンプレートを選べるようにする

### 主な対象ファイル

- `src/documentationTools.ts`
- `src/templateCommand.ts`
- `src/pluginWizard.ts`
- `src/codeActions.ts`
- `package.json`

### 完了条件

- コマンドパレットから学習支援コマンドを実行できる
- ネットワークや外部AIなしでも最低限の説明・テンプレートが出る
- 既存のプラグインウィザードと役割が重複しすぎない

## Phase 5: プラグインAPI補完の同期強化

目的: `hajimu_gui`、`hajimu_web`、`hajimu_discord`、`engine_*` 系の補完を実装と同期しやすくする。

進捗: Kaname で使う `engine_render` / `engine_2d` / `engine_rpg` / `engine_audio` / `engine_core` の補完データ、推奨エイリアス、ブラケット形式ホバー/補完を追加し、エンジン系データを `pluginDataEngine.ts` に分割済み。

### 実装項目

- [x] `pluginData.ts` をカテゴリ別データへ分割する
- [x] `jp-pack` や `jp-discord` の `HajimuPluginFunc` テーブルから補完データを生成するスクリプトを検討する
- [x] Kanameでよく使う公式エイリアスを優先表示する
- [x] 例: `hajimu_gui` -> `GUI`、`engine_render` -> `描画`
- [x] 取り込み済みエイリアスに応じた補完を強化する
- [x] 未取り込みのプラグイン関数を使ったときに `取り込む` 候補を出す

### 主な対象ファイル

- `src/pluginData.ts`
- `src/completion.ts`
- `src/hover.ts`
- `src/diagnostics.ts`
- `src/pluginWizard.ts`

### 完了条件

- Kanameの主要依存プラグインの補完が自然に出る
- 未取り込みプラグインへの案内ができる
- API追加時の更新箇所が分かりやすい

## Phase 6: 入力補助とスニペットの再設計

目的: 日本語コードを速く、迷わず書けるようにする。

進捗: 完了。ローマ字/英語短縮、import系スニペット、import短縮入力、壊れたスニペットプレースホルダ、classテンプレートを整理済み。

### 実装項目

- [x] ローマ字展開、英語短縮、既存スニペットを統合して重複を減らす
- [x] `fn`、`kansu`、`関数` のどれからでも同じ関数テンプレートに到達できるようにする
- [x] ループ、条件分岐、try/catch、class、import のテンプレートを整理する
- [x] `取り込む "..." として ...` の補完をプラグイン名候補付きにする
- [x] 閉じ忘れやすい構文では `終わり` 付きテンプレートを優先する

### 主な対象ファイル

- `snippets/hajimu.json`
- `src/snippetCompletion.ts`
- `src/templateCommand.ts`
- `src/aliasExpander.ts`

### 完了条件

- 初心者が短縮入力だけで主要構文を書ける
- 同じ用途の候補が多すぎて邪魔にならない
- スニペット展開後のカーソル位置が自然

## Phase 7: 品質保証とサンプル検証

目的: 拡張機能の改善が実コードで役に立つことを確認する。

進捗: 完了。`test_all_features.jp` を現行構文向けの手動確認サンプルに更新し、`VERIFICATION.md` と `EXTENSION_TEST_PLAN.md` を追加。`npm run verify:assets` で基本検証を実行できる。

### 実装項目

- [x] `test_all_features.jp` を拡張機能の手動確認用サンプルとして整理する
- [x] Kanameの `main.jp` と主要モジュールを診断対象の実例として確認する
- [x] jp-examples の代表サンプルで補完・診断の暴発を確認する
- [x] 主要機能ごとのチェックリストを `ROADMAP.md` または別ファイルに追加する
- [x] 将来的に VS Code Extension Test の導入を検討する

### 主な対象ファイル

- `test_all_features.jp`
- `src/diagnostics.ts`
- `src/completion.ts`
- `src/hover.ts`
- `package.json`

### 完了条件

- はじむ本体、Kaname、サンプル集の実コードで大きな誤診断がない
- ローマ字展開が通常の識別子入力を邪魔しない
- リリース前チェック項目が明文化されている

## 推奨実装順

1. Phase 0: データ構造と設定項目を整理
2. Phase 1: ローマ字補完を安全な `Tab` 展開として実装
3. Phase 2: 診断メッセージとQuick Fixを改善
4. Phase 6: スニペットと短縮入力を整理
5. Phase 3: ホバーに英語対応語を追加
6. Phase 5: プラグインAPI補完の同期強化
7. Phase 4: 学習支援コマンドを追加
8. Phase 7: 実コードで検証し、リリース準備

## 設計方針

- コードは日本語、入力は速く
- 日本語だけに閉じず、英語の概念名にも自然につなげる
- 自動変換は必ず設定で切れるようにする
- コメント・文字列・識別子途中では入力補助を暴発させない
- 初心者向け説明は親切に、熟練者向けには邪魔にならないよう短く
- Kanameのような実アプリを最重要の実用テストケースにする
