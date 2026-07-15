# はじむ (Hajimu) Language Support for VS Code

**日本語プログラミング言語「はじむ」の VS Code 拡張機能**

完全日本語構文のプログラミング言語「はじむ」を VS Code で快適に開発するための拡張機能です。

## ✨ 機能

### 🎨 シンタックスハイライト
- キーワード（`関数`、`もし`、`変数` など）
- 多数の組み込み関数
- 文字列、数値、コメント
- 文字列補間（`{式}`）
- 演算子（`|>`、`=>`、`??` など）

### 💡 コード補完
- すべてのキーワードを補完候補に表示
- 多数の組み込み関数をカテゴリ付きで補完
- ファイル内の変数・関数・クラス名を自動補完
- 括弧の自動入力
- ローマ字・英語エイリアスから日本語キーワードへ展開
- プラグイン関数と import 候補を文脈に合わせて補完

### 📝 スニペット
よく使う構文パターンを素早く入力：

| プレフィックス | 説明 |
|---|---|
| `関数` / `func` | 関数定義 |
| `もし` / `if` | 条件分岐 |
| `繰り返す` / `for` | カウンタループ |
| `条件` / `while` | 条件ループ |
| `型` / `class` | クラス定義 |
| `試行` / `try` | 例外処理 |
| `変数` / `var` | 変数宣言 |
| `表示` / `print` | コンソール出力 |
| `HTTP取得` / `httpget` | HTTPリクエスト |
| `取り込む` / `import` | プラグイン import |
| その他30+種類 | ... |

### 🌐 はじむ v1.4.0 英語構文対応
- `.jp` に加えて `.haj` / `.hajimu` をはじむファイルとして認識
- `function` / `var` / `if` / `for` / `return` / `class` / `new` などの英語構文 alias をハイライト
- 英語構文 alias でもブロック折りたたみ・インデント補助が動作
- 日本語構文と英語構文を混ぜたコードでも補完・ホバー・診断を利用可能

### 日本語入力支援
日本語キーワードの入力速度を上げるため、ローマ字、かな、表記ゆれ、英語名から補完できます。

| 入力 | 展開後 |
|---|---|
| `kansu` / `func` | `関数` |
| `hensuu` / `var` | `変数` |
| `moshi` / `if` | `もし` |
| `modosu` / `return` | `戻す` |
| `torikomu` / `import` | `取り込む` |
| `hyouji` / `print` | `表示` |
| `かんすう` | `関数` |
| `取りこむ` / `とりこむ` | `取り込む` |
| `繰返す` / `くりかえす` | `繰り返す` |

`hajimu.romajiExpansion.autoExpandOnSpace` を有効にすると、`kansu ` のような入力をスペース確定で自動展開できます。

日本語IMEのまま `（ ）`、`＝`、全角英数字などを入力した場合は、コード領域だけを自動的に半角へ整えます。文字列とコメントの内容は変更しません。既存コードはコマンドパレットの「はじむ: 全角記号をコード用に整える」でまとめて整形できます。

### 診断と Quick Fix
- 日本語・英語構文のブロック対応を識別子との境界まで見て診断
- 未定義の可能性がある識別子に近い名前を提案（任意設定）
- プラグイン関数の import 候補を Quick Fix で追加
- `戻す` / `返す` の混在や import 構文の違いを説明
- 括弧不足、辞書アクセス、配列アクセス、関数呼び出しを個別に診断
- エラー行を日本語で説明するコマンドを提供

### 🔍 ホバー情報
- キーワードにカーソルを合わせると構文説明を表示
- 組み込み関数のシグネチャ・説明・カテゴリを表示
- プラグイン関数とブラケット形式呼び出しの説明を表示

### ▶️ 実行サポート
- エディタ上部の再生ボタンで実行
- 右クリックメニューから実行
- 選択範囲のみ実行
- ショートカットキー: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R`

### 📐 言語設定
- 自動インデント（ブロック構文に対応）
- コードフォールディング
- ブラケットの自動ペアリング
- コメントトグル (`//`)

### ⚡ テンプレート挿入（高速コーディング）
**Cmd+Alt+X で迅速にコード生成:**
- `Cmd+Alt+F`: 関数テンプレート
- `Cmd+Alt+Shift+F`: 関数テンプレート（戻り値あり）
- `Cmd+Alt+C`: クラステンプレート
- `Cmd+Alt+I`: if-else テンプレート
- `Cmd+Alt+Shift+I`: if-else if-else テンプレート
- `Cmd+Alt+L`: for ループテンプレート
- `Cmd+Alt+W`: while ループテンプレート
- `Cmd+Alt+T`: try-catch-finally テンプレート

**エイリアス短縮入力（リアルタイム展開）:**
「fn 」と入力するだけで関数テンプレートが自動展開：
- `fn` → 関数テンプレート
- `fnr` → 関数テンプレート（戻り値）
- `cl` → クラステンプレート
- `if` → if-else テンプレート
- `ifi` → if-else if-else テンプレート
- `lp` → for ループテンプレート
- `wh` → while ループテンプレート
- `tc` → try-catch テンプレート

### 🎨 カラーテーマ
2種類のテーマを用意：
- **はじむ ダーク**: Blue キーワード、Yellow 関数、Cyan 組み込み関数
- **はじむ ライト**: Blue キーワード、Brown 関数、Teal 組み込み関数

### 🐛 デバッグ & ブレークポイント
**統合デバッグ機能（v2.0.2 新機能）:**
- ブレークポイント設定・管理（ガター装飾）
- デバッグモード実行（コンソール出力キャプチャ）
- 実行停止・リセット機能

**デバッグコマンド:**
- `Cmd+Shift+D`: デバッグ実行
- `Cmd+Shift+X`: デバッグ停止
- `Cmd+Shift+L`: ブレークポイント切り替え

### 🔌 プラグインウィザード
**GUI/Web/Discord プラグイン自動セットアップ（v2.0.2 新機能）:**
- `Cmd+Alt+P`: プラグインウィザード起動
- GUI / Web / Discord / 描画 / 音声 / RPG などのプラグインを複数選択
- 自動インポート生成
- サンプルコード挿入
- HTML ドキュメント表示

### 📚 学習支援（v2.0.3+）
- はじむ構文を英語圏言語の用語で説明
- 選択コードの処理内容を説明
- 選択コードの改善ポイントを表示
- エラーが出ている行の原因と直し方を説明
- サンプルコードから新規ファイルを開始

## 📦 インストール

### VS Code マーケットプレイスから
1. VS Code を開く
2. 拡張機能タブ (`Cmd+Shift+X`)
3. 「はじむ」で検索
4. インストール

### VSIX ファイルから
```bash
code --install-extension hajimu-language-2.1.0.vsix
```

## ⚙️ 設定

| 設定 | デフォルト | 説明 |
|---|---|---|
| `hajimu.executablePath` | `hajimu` | インタープリタのパス |
| `hajimu.runInTerminal` | `true` | ターミナルで実行するか |
| `hajimu.diagnostics.enabled` | `true` | リアルタイム診断を有効にする |
| `hajimu.diagnostics.undefinedIdentifiers` | `false` | 推測による未定義識別子の候補表示を有効にする |
| `hajimu.editor.indentDiagnostics` | `false` | 全角空白・インデント文字混在の診断を有効にする |
| `hajimu.japaneseInput.autoNormalizeFullWidthSymbols` | `true` | コード中の全角記号・英数字を自動的に半角化する |
| `hajimu.plugins.gui.enabled` | `true` | GUI プラグイン補完を有効にする |
| `hajimu.plugins.web.enabled` | `true` | Web プラグイン補完を有効にする |
| `hajimu.plugins.discord.enabled` | `true` | Discord プラグイン補完を有効にする |
| `hajimu.romajiExpansion.enabled` | `true` | ローマ字・短縮入力補完を有効にする |
| `hajimu.romajiExpansion.autoExpandOnSpace` | `false` | スペース入力時の自動展開を有効にする |
| `hajimu.romajiExpansion.includeEnglishAliases` | `true` | 英語エイリアス候補を有効にする |

### 対応ファイル拡張子

| 拡張子 | 用途 |
|---|---|
| `.jp` | 日本語中心のはじむソース |
| `.haj` | 英語 alias を含む教材・海外向けソース |
| `.hajimu` | はじむソースであることを明示したい場合 |

### はじむのインストール
```bash
brew tap ReoShiozawa/hajimu
brew install hajimu
```

## 📸 スクリーンショット

### シンタックスハイライト
```hajimu
// フィボナッチ数列
関数 フィボナッチ(数):
    もし 数 <= 1 なら
        戻す 数
    終わり
    戻す フィボナッチ(数 - 1) + フィボナッチ(数 - 2)
終わり

i を 0 から 10 繰り返す
    表示("F({i}) = {フィボナッチ(i)}")
終わり
```

### クラスとHTTP
```hajimu
型 APIクライアント:
    初期化(ベースURL):
        自分.url = ベースURL
    終わり

    関数 取得(パス):
        戻す HTTP取得(自分.url + パス)
    終わり
終わり

変数 api = 新規 APIクライアント("https://api.example.com")
変数 データ = api.取得("/users")
表示(JSON解析(データ))
```

## 🔗 リンク

- **はじむ公式サイト**: https://reoshiozawa.github.io/hajimu-document/
- **GitHubリポジトリ**: https://github.com/ReoShiozawa/hajimu
- **Issue**: https://github.com/ReoShiozawa/hajimu-vscode/issues

## 📝 ライセンス

MIT License - [Reo Shiozawa](https://github.com/ReoShiozawa)
