# はじむ (Hajimu) Language Support for VS Code

**日本語プログラミング言語「はじむ」の VS Code 拡張機能**

完全日本語構文のプログラミング言語「はじむ」を VS Code で快適に開発するための拡張機能です。

## ✨ 機能

### 🎨 シンタックスハイライト
- キーワード（`関数`、`もし`、`変数` など）
- 143個の組み込み関数
- 文字列、数値、コメント
- 文字列補間（`{式}`）
- 演算子（`|>`、`=>`、`??` など）

### 💡 コード補完
- すべてのキーワードを補完候補に表示
- 143個の組み込み関数をカテゴリ付きで補完
- ファイル内の変数・関数・クラス名を自動補完
- 括弧の自動入力

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
| その他30+種類 | ... |

### 🔍 ホバー情報
- キーワードにカーソルを合わせると構文説明を表示
- 組み込み関数のシグネチャ・説明・カテゴリを表示

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

## 📦 インストール

### VS Code マーケットプレイスから
1. VS Code を開く
2. 拡張機能タブ (`Cmd+Shift+X`)
3. 「はじむ」で検索
4. インストール

### VSIX ファイルから
```bash
code --install-extension hajimu-language-1.0.0.vsix
```

## ⚙️ 設定

| 設定 | デフォルト | 説明 |
|---|---|---|
| `hajimu.executablePath` | `hajimu` | インタープリタのパス |
| `hajimu.runInTerminal` | `true` | ターミナルで実行するか |

### はじむのインストール
```bash
brew tap ReoShiozawa/hajimu
brew install hajimu
```

## 📸 スクリーンショット

### シンタックスハイライト
```hajimu
# フィボナッチ数列
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
