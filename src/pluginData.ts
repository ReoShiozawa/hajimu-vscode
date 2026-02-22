/**
 * はじむプラグイン関数データ — GUI, Web, Discord
 *
 * プラグイン関数は「プレフィックス.関数名()」の形式で呼び出される
 * 例: GUI.アプリ作成(), ウェブ.GET(), ボット.ボット作成()
 */

export interface PluginFuncInfo {
    name: string;
    description: string;
    signature: string;
    category: string;
}

export interface PluginInfo {
    pluginName: string;       // "hajimu_gui" etc
    displayName: string;      // "GUI" etc
    version: string;          // "13.0.0" etc
    commonAliases: string[];  // ["GUI", "画面", "gui"]
    description: string;
    functions: PluginFuncInfo[];
}

// ============================================================
// hajimu_gui プラグイン (1,074 関数)
// ============================================================
const GUI_FUNCTIONS: PluginFuncInfo[] = [
    // --- アプリケーション管理 ---
    { name: 'アプリ作成', description: 'GUIアプリケーションを作成', signature: 'アプリ作成(タイトル, 幅, 高さ)', category: 'アプリケーション' },
    { name: '描画ループ', description: 'メイン描画ループを開始', signature: '描画ループ(アプリ, コールバック)', category: 'アプリケーション' },
    { name: 'アプリ終了', description: 'アプリケーションを終了', signature: 'アプリ終了()', category: 'アプリケーション' },
    { name: 'ウィンドウサイズ', description: 'ウィンドウサイズを取得', signature: 'ウィンドウサイズ()', category: 'ウィンドウ' },
    { name: 'ウィンドウタイトル', description: 'ウィンドウタイトルを設定', signature: 'ウィンドウタイトル(タイトル)', category: 'ウィンドウ' },
    { name: 'ウィンドウリサイズ', description: 'ウィンドウサイズを変更', signature: 'ウィンドウリサイズ(幅, 高さ)', category: 'ウィンドウ' },
    { name: 'フレームレート', description: 'フレームレートを設定', signature: 'フレームレート(FPS)', category: 'アプリケーション' },
    { name: '背景色', description: '背景色を設定', signature: '背景色(R, G, B, A?)', category: 'スタイル' },
    // --- 色 ---
    { name: '色', description: 'RGBA色を作成', signature: '色(R, G, B, A?)', category: '色' },
    { name: '色16進', description: '16進数カラーコードから色を作成', signature: '色16進("#RRGGBB")', category: '色' },
    // --- 基本ウィジェット ---
    { name: 'テキスト', description: 'テキストを表示', signature: 'テキスト(文字列)', category: 'ウィジェット' },
    { name: '見出し', description: '見出しテキストを表示', signature: '見出し(文字列)', category: 'ウィジェット' },
    { name: 'ボタン', description: 'ボタンを作成', signature: 'ボタン(ラベル) → 真偽', category: 'ウィジェット' },
    { name: 'チェックボックス', description: 'チェックボックスを作成', signature: 'チェックボックス(ラベル, 値) → 真偽', category: 'ウィジェット' },
    { name: 'ラジオボタン', description: 'ラジオボタンを作成', signature: 'ラジオボタン(ラベル, 選択肢, 現在値)', category: 'ウィジェット' },
    { name: 'スライダー', description: 'スライダーを作成', signature: 'スライダー(ラベル, 値, 最小, 最大)', category: 'ウィジェット' },
    { name: 'プログレスバー', description: 'プログレスバーを表示', signature: 'プログレスバー(値, 最大?)', category: 'ウィジェット' },
    { name: 'セパレーター', description: '区切り線を描画', signature: 'セパレーター()', category: 'レイアウト' },
    { name: 'スペーサー', description: 'スペースを挿入', signature: 'スペーサー(高さ)', category: 'レイアウト' },
    { name: 'ツールチップ', description: 'ウィジェットにツールチップを設定', signature: 'ツールチップ(テキスト)', category: 'ウィジェット' },
    // --- 入力 ---
    { name: 'テキスト入力', description: 'テキスト入力フィールド', signature: 'テキスト入力(ラベル, 値)', category: '入力' },
    { name: 'パスワード入力', description: 'パスワード入力フィールド', signature: 'パスワード入力(ラベル, 値)', category: '入力' },
    { name: '数値入力', description: '数値入力フィールド', signature: '数値入力(ラベル, 値, 最小, 最大)', category: '入力' },
    { name: 'テキストエリア', description: '複数行テキスト入力', signature: 'テキストエリア(ラベル, 値, 行数?)', category: '入力' },
    { name: 'コンボボックス', description: 'ドロップダウン選択', signature: 'コンボボックス(ラベル, 選択肢, 現在値)', category: '入力' },
    // --- レイアウト ---
    { name: 'パネル開始', description: 'パネルレイアウトを開始', signature: 'パネル開始(タイトル?)', category: 'レイアウト' },
    { name: 'パネル終了', description: 'パネルレイアウトを終了', signature: 'パネル終了()', category: 'レイアウト' },
    { name: '横並び開始', description: '横並びレイアウトを開始', signature: '横並び開始()', category: 'レイアウト' },
    { name: '横並び終了', description: '横並びレイアウトを終了', signature: '横並び終了()', category: 'レイアウト' },
    { name: 'インデント', description: 'インデントを追加', signature: 'インデント(ピクセル)', category: 'レイアウト' },
    { name: 'インデント解除', description: 'インデントを解除', signature: 'インデント解除()', category: 'レイアウト' },
    // --- マウス・入力イベント ---
    { name: 'マウス位置', description: 'マウス位置を取得', signature: 'マウス位置() → [x, y]', category: 'イベント' },
    { name: 'マウスクリック', description: 'マウスクリック状態を取得', signature: 'マウスクリック() → 真偽', category: 'イベント' },
    { name: 'マウスボタン', description: 'マウスボタンの状態を取得', signature: 'マウスボタン(ボタン番号) → 真偽', category: 'イベント' },
    { name: 'キー押下', description: 'キーの押下状態を取得', signature: 'キー押下(キー名) → 真偽', category: 'イベント' },
    // --- リスト・テーブル ---
    { name: 'リスト', description: 'リストを表示', signature: 'リスト(項目配列)', category: 'データ表示' },
    { name: 'テーブル作成', description: 'テーブルを作成', signature: 'テーブル作成(列配列)', category: 'データ表示' },
    { name: 'テーブル行追加', description: 'テーブルに行を追加', signature: 'テーブル行追加(テーブル, 行データ)', category: 'データ表示' },
    { name: 'テーブル描画', description: 'テーブルを描画', signature: 'テーブル描画(テーブル)', category: 'データ表示' },
    { name: 'テーブルソート', description: 'テーブルをソート', signature: 'テーブルソート(テーブル, 列, 昇順?)', category: 'データ表示' },
    // --- ツリー ---
    { name: 'ツリー作成', description: 'ツリービューを作成', signature: 'ツリー作成()', category: 'データ表示' },
    { name: 'ツリーノード追加', description: 'ツリーにノードを追加', signature: 'ツリーノード追加(ツリー, 親, ラベル)', category: 'データ表示' },
    { name: 'ツリー描画', description: 'ツリーを描画', signature: 'ツリー描画(ツリー)', category: 'データ表示' },
    // --- タブ ---
    { name: 'タブバー', description: 'タブバーを作成', signature: 'タブバー(タブ名配列, 現在タブ)', category: 'ナビゲーション' },
    { name: 'タブ内容', description: 'タブ内容を設定', signature: 'タブ内容(タブ名)', category: 'ナビゲーション' },
    // --- メニュー ---
    { name: 'メニューバー開始', description: 'メニューバーを開始', signature: 'メニューバー開始()', category: 'メニュー' },
    { name: 'メニューバー終了', description: 'メニューバーを終了', signature: 'メニューバー終了()', category: 'メニュー' },
    { name: 'メニュー', description: 'メニューを作成', signature: 'メニュー(ラベル)', category: 'メニュー' },
    { name: 'メニュー項目', description: 'メニュー項目を追加', signature: 'メニュー項目(ラベル) → 真偽', category: 'メニュー' },
    { name: 'メニューセパレーター', description: 'メニュー区切り線', signature: 'メニューセパレーター()', category: 'メニュー' },
    // --- ダイアログ ---
    { name: 'ダイアログ', description: 'ダイアログを表示', signature: 'ダイアログ(タイトル, メッセージ)', category: 'ダイアログ' },
    { name: 'ファイルダイアログ', description: 'ファイル選択ダイアログ', signature: 'ファイルダイアログ(モード?, フィルタ?)', category: 'ダイアログ' },
    { name: 'メッセージ', description: 'メッセージダイアログ', signature: 'メッセージ(タイトル, 内容, タイプ?)', category: 'ダイアログ' },
    { name: 'トースト', description: 'トースト通知を表示', signature: 'トースト(メッセージ, 表示秒?)', category: 'ダイアログ' },
    // --- キャンバス・描画 ---
    { name: 'キャンバス開始', description: 'キャンバス描画を開始', signature: 'キャンバス開始(幅, 高さ)', category: 'キャンバス' },
    { name: 'キャンバス終了', description: 'キャンバス描画を終了', signature: 'キャンバス終了()', category: 'キャンバス' },
    { name: '線', description: '線を描画', signature: '線(x1, y1, x2, y2)', category: 'キャンバス' },
    { name: '矩形', description: '塗りつぶし矩形を描画', signature: '矩形(x, y, 幅, 高さ)', category: 'キャンバス' },
    { name: '矩形枠', description: '矩形の枠を描画', signature: '矩形枠(x, y, 幅, 高さ)', category: 'キャンバス' },
    { name: '角丸矩形', description: '角丸矩形を描画', signature: '角丸矩形(x, y, 幅, 高さ, 角丸)', category: 'キャンバス' },
    { name: '円', description: '円を描画', signature: '円(中心x, 中心y, 半径)', category: 'キャンバス' },
    { name: '円弧', description: '円弧を描画', signature: '円弧(中心x, 中心y, 半径, 開始角, 終了角)', category: 'キャンバス' },
    { name: '多角形', description: '多角形を描画', signature: '多角形(頂点配列)', category: 'キャンバス' },
    { name: 'パス開始', description: 'パス描画を開始', signature: 'パス開始()', category: 'キャンバス' },
    { name: 'パス終了', description: 'パス描画を終了', signature: 'パス終了()', category: 'キャンバス' },
    { name: 'パス移動', description: 'パスの始点を移動', signature: 'パス移動(x, y)', category: 'キャンバス' },
    { name: 'パス線', description: 'パスに線を追加', signature: 'パス線(x, y)', category: 'キャンバス' },
    { name: 'ベジェ', description: 'ベジェ曲線を描画', signature: 'ベジェ(cp1x, cp1y, cp2x, cp2y, x, y)', category: 'キャンバス' },
    { name: '線形グラデーション', description: '線形グラデーションを作成', signature: '線形グラデーション(x1, y1, x2, y2, 色1, 色2)', category: 'キャンバス' },
    // --- 画像 ---
    { name: '画像読み込み', description: '画像ファイルを読み込み', signature: '画像読み込み(パス)', category: '画像' },
    { name: '画像描画', description: '画像を描画', signature: '画像描画(画像, x, y, 幅?, 高さ?)', category: '画像' },
    { name: '描画テキスト', description: 'テキストをキャンバスに描画', signature: '描画テキスト(x, y, 文字列)', category: 'キャンバス' },
    // --- 変換 ---
    { name: '変換保存', description: '変換状態を保存', signature: '変換保存()', category: '変換' },
    { name: '変換復元', description: '変換状態を復元', signature: '変換復元()', category: '変換' },
    { name: '平行移動', description: '平行移動', signature: '平行移動(x, y)', category: '変換' },
    { name: '回転', description: '回転変換', signature: '回転(角度)', category: '変換' },
    { name: '拡縮', description: '拡縮変換', signature: '拡縮(x倍率, y倍率)', category: '変換' },
    // --- テーマ ---
    { name: 'テーマ設定', description: 'テーマを設定', signature: 'テーマ設定(テーマ名)', category: 'テーマ' },
    { name: 'テーマ色', description: 'テーマカラーを設定', signature: 'テーマ色(キー, 色)', category: 'テーマ' },
    { name: 'テーマフォント', description: 'テーマフォントを設定', signature: 'テーマフォント(フォント)', category: 'テーマ' },
    { name: 'スタイル設定', description: 'スタイルを設定', signature: 'スタイル設定(プロパティ, 値)', category: 'テーマ' },
    { name: 'フォント読み込み', description: 'フォントを読み込み', signature: 'フォント読み込み(パス)', category: 'テーマ' },
    { name: 'フォントサイズ', description: 'フォントサイズを設定', signature: 'フォントサイズ(サイズ)', category: 'テーマ' },
    { name: 'DPIスケール', description: 'DPIスケールを取得/設定', signature: 'DPIスケール(値?)', category: 'テーマ' },
    // --- ドラッグ＆ドロップ ---
    { name: 'ドラッグソース', description: 'ドラッグ元を設定', signature: 'ドラッグソース(データ)', category: 'DnD' },
    { name: 'ドロップターゲット', description: 'ドロップ先を設定', signature: 'ドロップターゲット() → データ', category: 'DnD' },
    { name: 'ファイルドロップ取得', description: 'ドロップされたファイルを取得', signature: 'ファイルドロップ取得()', category: 'DnD' },
    // --- クリップボード ---
    { name: 'クリップボード取得', description: 'クリップボードの内容を取得', signature: 'クリップボード取得()', category: 'クリップボード' },
    { name: 'クリップボード設定', description: 'クリップボードに内容を設定', signature: 'クリップボード設定(内容)', category: 'クリップボード' },
    // --- ショートカット・カーソル ---
    { name: 'ショートカット', description: 'キーボードショートカットを登録', signature: 'ショートカット(キー, コールバック)', category: 'イベント' },
    { name: 'カーソル設定', description: 'マウスカーソルを設定', signature: 'カーソル設定(タイプ)', category: 'イベント' },
    // --- アニメーション ---
    { name: 'アニメーション', description: 'アニメーション値を取得', signature: 'アニメーション(開始, 終了, 時間)', category: 'アニメーション' },
    { name: 'トランジション', description: 'トランジションアニメーション', signature: 'トランジション(値, 目標, 速度)', category: 'アニメーション' },
    { name: 'タイマー', description: 'タイマーを作成', signature: 'タイマー(ミリ秒, コールバック)', category: 'アニメーション' },
    { name: 'タイマー停止', description: 'タイマーを停止', signature: 'タイマー停止(タイマーID)', category: 'アニメーション' },
    // --- 拡張ウィジェット ---
    { name: 'トグルスイッチ', description: 'トグルスイッチ', signature: 'トグルスイッチ(ラベル, 値)', category: 'ウィジェット' },
    { name: 'カラーピッカー', description: 'カラーピッカー', signature: 'カラーピッカー(ラベル, 色)', category: '入力' },
    { name: 'スピナー', description: 'ローディングスピナー', signature: 'スピナー()', category: 'ウィジェット' },
    { name: '折りたたみ', description: '折りたたみセクション', signature: '折りたたみ(ラベル, 開?) → 真偽', category: 'レイアウト' },
    { name: 'リンク', description: 'ハイパーリンク', signature: 'リンク(テキスト, URL?)', category: 'ウィジェット' },
    { name: '選択可能', description: '選択可能テキスト', signature: '選択可能(テキスト, 選択中?) → 真偽', category: 'ウィジェット' },
    { name: 'バッジ', description: 'バッジ', signature: 'バッジ(テキスト, 色?)', category: 'ウィジェット' },
    { name: 'タグ', description: 'タグコンポーネント', signature: 'タグ(テキスト, 色?)', category: 'ウィジェット' },
    { name: 'カード開始', description: 'カードレイアウトを開始', signature: 'カード開始(タイトル?)', category: 'レイアウト' },
    { name: 'カード終了', description: 'カードレイアウトを終了', signature: 'カード終了()', category: 'レイアウト' },
    // --- グラフ ---
    { name: '折れ線グラフ', description: '折れ線グラフを描画', signature: '折れ線グラフ(データ, オプション?)', category: 'チャート' },
    { name: '棒グラフ', description: '棒グラフを描画', signature: '棒グラフ(データ, オプション?)', category: 'チャート' },
    { name: '円グラフ', description: '円グラフを描画', signature: '円グラフ(データ, オプション?)', category: 'チャート' },
    { name: '散布図', description: '散布図を描画', signature: '散布図(データ, オプション?)', category: 'チャート' },
    { name: 'エリアチャート', description: 'エリアチャートを描画', signature: 'エリアチャート(データ, オプション?)', category: 'チャート' },
    { name: 'ゲージ', description: 'ゲージを描画', signature: 'ゲージ(値, 最大, オプション?)', category: 'チャート' },
    { name: 'スパークライン', description: 'スパークラインを描画', signature: 'スパークライン(データ)', category: 'チャート' },
    { name: 'ヒストグラム', description: 'ヒストグラムを描画', signature: 'ヒストグラム(データ, ビン数?)', category: 'チャート' },
    // --- ウィンドウ管理 ---
    { name: '子ウィンドウ開始', description: '子ウィンドウを開始', signature: '子ウィンドウ開始(タイトル, 幅, 高さ)', category: 'ウィンドウ' },
    { name: '子ウィンドウ終了', description: '子ウィンドウを終了', signature: '子ウィンドウ終了()', category: 'ウィンドウ' },
    { name: 'ポップアップ開始', description: 'ポップアップを開始', signature: 'ポップアップ開始(名前)', category: 'ウィンドウ' },
    { name: 'ポップアップ終了', description: 'ポップアップを終了', signature: 'ポップアップ終了()', category: 'ウィンドウ' },
    { name: 'ポップアップ表示', description: 'ポップアップを表示制御', signature: 'ポップアップ表示(名前)', category: 'ウィンドウ' },
    { name: 'マルチウィンドウ', description: '新しいウィンドウを作成', signature: 'マルチウィンドウ(タイトル, 幅, 高さ)', category: 'ウィンドウ' },
    { name: 'ウィンドウ位置', description: 'ウィンドウ位置を設定', signature: 'ウィンドウ位置(x, y)', category: 'ウィンドウ' },
    { name: 'ウィンドウ最大化', description: 'ウィンドウを最大化', signature: 'ウィンドウ最大化()', category: 'ウィンドウ' },
    { name: 'ウィンドウ最小化', description: 'ウィンドウを最小化', signature: 'ウィンドウ最小化()', category: 'ウィンドウ' },
    { name: 'フルスクリーン', description: 'フルスクリーン切替', signature: 'フルスクリーン(有効?)', category: 'ウィンドウ' },
    // --- ナビゲーション ---
    { name: 'ナビゲーションバー', description: 'ナビゲーションバーを表示', signature: 'ナビゲーションバー(項目配列)', category: 'ナビゲーション' },
    { name: 'ブレッドクラム', description: 'パンくずリスト', signature: 'ブレッドクラム(パス配列)', category: 'ナビゲーション' },
    { name: 'ステッパー', description: 'ステッパーを表示', signature: 'ステッパー(ステップ配列, 現在)', category: 'ナビゲーション' },
    { name: 'ページネーション', description: 'ページネーション', signature: 'ページネーション(総数, ページ, ページサイズ)', category: 'ナビゲーション' },
    { name: 'ボトムナビゲーション', description: 'ボトムナビゲーション', signature: 'ボトムナビゲーション(項目配列, 現在)', category: 'ナビゲーション' },
    // --- フォーム ---
    { name: 'フォーム作成', description: 'フォームを作成', signature: 'フォーム作成(名前)', category: 'フォーム' },
    { name: 'フォーム送信', description: 'フォームを送信', signature: 'フォーム送信(フォーム)', category: 'フォーム' },
    { name: 'フォームリセット', description: 'フォームをリセット', signature: 'フォームリセット(フォーム)', category: 'フォーム' },
    { name: 'フォーム検証', description: 'フォームを検証', signature: 'フォーム検証(フォーム)', category: 'フォーム' },
    { name: 'バリデーション', description: '入力バリデーション', signature: 'バリデーション(フィールド, ルール)', category: 'フォーム' },
    // --- アクセシビリティ ---
    { name: 'アクセシブル名', description: 'アクセシビリティ名を設定', signature: 'アクセシブル名(名前)', category: 'アクセシビリティ' },
    { name: 'アクセシブル説明', description: 'アクセシビリティ説明を設定', signature: 'アクセシブル説明(説明)', category: 'アクセシビリティ' },
    { name: 'アクセシブルロール', description: 'アクセシビリティロールを設定', signature: 'アクセシブルロール(ロール)', category: 'アクセシビリティ' },
    // --- 印刷・PDF ---
    { name: '印刷', description: '印刷を開始', signature: '印刷()', category: '印刷' },
    { name: '印刷プレビュー', description: '印刷プレビューを表示', signature: '印刷プレビュー()', category: '印刷' },
    { name: 'PDF出力', description: 'PDFファイルとして出力', signature: 'PDF出力(パス)', category: '印刷' },
    // --- データバインディング ---
    { name: 'バインド', description: 'データバインディング', signature: 'バインド(モデル, プロパティ)', category: 'データバインディング' },
    { name: '双方向バインド', description: '双方向データバインディング', signature: '双方向バインド(モデル, プロパティ)', category: 'データバインディング' },
    { name: '監視', description: '値の変更を監視', signature: '監視(対象, コールバック)', category: 'データバインディング' },
    // --- i18n ---
    { name: '翻訳', description: '翻訳テキストを取得', signature: '翻訳(キー)', category: '国際化' },
    { name: '翻訳登録', description: '翻訳データを登録', signature: '翻訳登録(ロケール, 辞書)', category: '国際化' },
    { name: 'ロケール設定', description: 'ロケールを設定', signature: 'ロケール設定(ロケール)', category: '国際化' },
    // --- メディア ---
    { name: '音声再生', description: '音声ファイルを再生', signature: '音声再生(パス)', category: 'メディア' },
    { name: '音声停止', description: '音声再生を停止', signature: '音声停止()', category: 'メディア' },
    { name: '動画再生', description: '動画を再生', signature: '動画再生(パス, x, y, 幅, 高さ)', category: 'メディア' },
    // --- 3D ---
    { name: '3Dビューポート', description: '3Dビューポートを作成', signature: '3Dビューポート(幅, 高さ)', category: '3D' },
    { name: '3Dモデル読込', description: '3Dモデルを読み込み', signature: '3Dモデル読込(パス)', category: '3D' },
    { name: '3Dモデル描画', description: '3Dモデルを描画', signature: '3Dモデル描画(モデル)', category: '3D' },
    { name: '3Dカメラ', description: '3Dカメラを設定', signature: '3Dカメラ(位置, 注視点)', category: '3D' },
    { name: '3D光源', description: '3D光源を設定', signature: '3D光源(タイプ, 位置, 色)', category: '3D' },
    // --- システム連携 ---
    { name: 'システム通知', description: 'OS通知を送信', signature: 'システム通知(タイトル, メッセージ)', category: 'システム' },
    { name: 'システムトレイ', description: 'システムトレイアイコンを設定', signature: 'システムトレイ(アイコン, メニュー?)', category: 'システム' },
    { name: 'ブラウザ開く', description: 'URLをブラウザで開く', signature: 'ブラウザ開く(URL)', category: 'システム' },
    { name: 'スクリーンショット', description: 'スクリーンショットを撮影', signature: 'スクリーンショット(パス?)', category: 'システム' },
    // --- グリッド ---
    { name: 'グリッド開始', description: 'グリッドレイアウトを開始', signature: 'グリッド開始(列数)', category: 'レイアウト' },
    { name: 'グリッド終了', description: 'グリッドレイアウトを終了', signature: 'グリッド終了()', category: 'レイアウト' },
    { name: 'グリッド次列', description: 'グリッドの次の列に移動', signature: 'グリッド次列()', category: 'レイアウト' },
    // --- スクロール ---
    { name: 'スクロール領域開始', description: 'スクロール領域を開始', signature: 'スクロール領域開始(高さ)', category: 'レイアウト' },
    { name: 'スクロール領域終了', description: 'スクロール領域を終了', signature: 'スクロール領域終了()', category: 'レイアウト' },
    // --- OSテーマ ---
    { name: 'OSテーマ取得', description: 'OSのテーマ設定を取得', signature: 'OSテーマ取得() → "light"|"dark"', category: 'テーマ' },
    // --- 設定永続化 ---
    { name: '設定保存', description: 'アプリ設定を保存', signature: '設定保存(キー, 値)', category: '永続化' },
    { name: '設定読込', description: 'アプリ設定を読み込み', signature: '設定読込(キー, デフォルト?)', category: '永続化' },
    // --- Undo/Redo ---
    { name: '元に戻す', description: '操作を元に戻す', signature: '元に戻す()', category: '編集' },
    { name: 'やり直す', description: '操作をやり直す', signature: 'やり直す()', category: '編集' },
    // --- フォーカス ---
    { name: 'フォーカス設定', description: 'ウィジェットにフォーカスを設定', signature: 'フォーカス設定(ID)', category: 'イベント' },
    { name: 'フォーカス取得', description: '現在のフォーカスを取得', signature: 'フォーカス取得()', category: 'イベント' },
    // --- 高度なウィジェット ---
    { name: 'ダイヤル', description: 'ダイヤルコントロール', signature: 'ダイヤル(ラベル, 値, 最小, 最大)', category: 'ウィジェット' },
    { name: 'カレンダー', description: 'カレンダーウィジェット', signature: 'カレンダー(選択日?)', category: 'ウィジェット' },
    { name: '評価', description: '評価（星）コンポーネント', signature: '評価(ラベル, 値, 最大?)', category: 'ウィジェット' },
    { name: 'アバター', description: 'アバター画像', signature: 'アバター(画像パス, サイズ?)', category: 'ウィジェット' },
    { name: 'タイムライン', description: 'タイムライン表示', signature: 'タイムライン(項目配列)', category: 'ウィジェット' },
    { name: 'スケルトン', description: 'スケルトンローディング', signature: 'スケルトン(幅, 高さ)', category: 'ウィジェット' },
    { name: 'カルーセル', description: 'カルーセル', signature: 'カルーセル(項目配列)', category: 'ウィジェット' },
    // --- エフェクト ---
    { name: 'イージング', description: 'イージング関数を適用', signature: 'イージング(タイプ, 進行度)', category: 'アニメーション' },
    { name: 'フェードイン', description: 'フェードインアニメーション', signature: 'フェードイン(時間?)', category: 'アニメーション' },
    { name: 'フェードアウト', description: 'フェードアウトアニメーション', signature: 'フェードアウト(時間?)', category: 'アニメーション' },
    { name: 'シェイク', description: 'シェイクアニメーション', signature: 'シェイク(強度?, 時間?)', category: 'アニメーション' },
    { name: 'パルス', description: 'パルスアニメーション', signature: 'パルス(時間?)', category: 'アニメーション' },
    // --- 高度な描画 ---
    { name: '楕円', description: '楕円を描画', signature: '楕円(x, y, rx, ry)', category: 'キャンバス' },
    { name: '矢印線', description: '矢印線を描画', signature: '矢印線(x1, y1, x2, y2)', category: 'キャンバス' },
    { name: '影', description: '影を設定', signature: '影(ぼかし, x, y, 色)', category: 'キャンバス' },
    { name: '放射グラデーション', description: '放射グラデーションを作成', signature: '放射グラデーション(cx, cy, r, 色1, 色2)', category: 'キャンバス' },
    // --- 地図 ---
    { name: '地図ウィジェット', description: '地図を表示', signature: '地図ウィジェット(緯度, 経度, ズーム)', category: '地図' },
    { name: '地図マーカー', description: '地図にマーカーを追加', signature: '地図マーカー(緯度, 経度, ラベル?)', category: '地図' },
    // --- エディタ ---
    { name: 'リッチテキストエディタ', description: 'リッチテキストエディタ', signature: 'リッチテキストエディタ(内容)', category: 'エディタ' },
    { name: 'コードエディタ', description: 'コードエディタ', signature: 'コードエディタ(内容, 言語?)', category: 'エディタ' },
    { name: 'マークダウンエディタ', description: 'マークダウンエディタ', signature: 'マークダウンエディタ(内容)', category: 'エディタ' },
    // --- ノード・フローチャート ---
    { name: 'ノードエディタ', description: 'ノードエディタ', signature: 'ノードエディタ(ノード配列, 接続配列)', category: 'エディタ' },
    { name: 'フローチャート', description: 'フローチャートを描画', signature: 'フローチャート(ノード配列, 接続配列)', category: 'チャート' },
    { name: 'マインドマップ', description: 'マインドマップを描画', signature: 'マインドマップ(ルートノード)', category: 'チャート' },
    { name: '組織図', description: '組織図を描画', signature: '組織図(ノード配列)', category: 'チャート' },
    // --- QR ---
    { name: 'QRコード', description: 'QRコードを生成', signature: 'QRコード(データ, サイズ?)', category: 'ウィジェット' },
    { name: 'バーコード', description: 'バーコードを生成', signature: 'バーコード(データ, タイプ?)', category: 'ウィジェット' },
    // --- チャットUI ---
    { name: 'チャットUI', description: 'チャットUIを表示', signature: 'チャットUI(メッセージ配列)', category: 'AI/チャット' },
    { name: 'チャットバブル', description: 'チャットバブルを表示', signature: 'チャットバブル(テキスト, 送信者?)', category: 'AI/チャット' },
    { name: 'ストリーミングテキスト', description: 'ストリーミングテキスト', signature: 'ストリーミングテキスト(テキスト, 速度?)', category: 'AI/チャット' },
    { name: 'AIプログレス', description: 'AI処理中表示', signature: 'AIプログレス(メッセージ?)', category: 'AI/チャット' },
    // --- セキュリティ ---
    { name: 'ログインフォーム', description: 'ログインフォーム', signature: 'ログインフォーム(オプション?)', category: 'セキュリティ' },
    { name: '生体認証', description: '生体認証を要求', signature: '生体認証(メッセージ?)', category: 'セキュリティ' },
    { name: 'ロック画面', description: 'ロック画面を表示', signature: 'ロック画面(オプション?)', category: 'セキュリティ' },
    { name: '権限ゲート', description: '権限チェック付きUI', signature: '権限ゲート(権限名)', category: 'セキュリティ' },
];

// ============================================================
// hajimu_web プラグイン (94 関数)
// ============================================================
const WEB_FUNCTIONS: PluginFuncInfo[] = [
    // --- サーバー管理 ---
    { name: 'サーバー作成', description: 'Webサーバーを作成', signature: 'サーバー作成(ポート)', category: 'サーバー' },
    { name: '起動', description: 'サーバーを起動', signature: '起動()', category: 'サーバー' },
    { name: '停止', description: 'サーバーを停止', signature: '停止()', category: 'サーバー' },
    { name: 'ポート取得', description: 'ポート番号を取得', signature: 'ポート取得()', category: 'サーバー' },
    { name: '実行中', description: 'サーバーが実行中か確認', signature: '実行中() → 真偽', category: 'サーバー' },
    { name: 'サーバー情報', description: 'サーバー情報を取得', signature: 'サーバー情報()', category: 'サーバー' },
    // --- ミドルウェア ---
    { name: 'ミドルウェア', description: 'ミドルウェアを有効化', signature: 'ミドルウェア("logger"|"cors"|"json"|"security"|"rate_limit")', category: 'ミドルウェア' },
    { name: 'ミドルウェア一覧', description: 'ミドルウェア一覧を取得', signature: 'ミドルウェア一覧()', category: 'ミドルウェア' },
    { name: '使用', description: 'カスタムミドルウェアを使用', signature: '使用(関数)', category: 'ミドルウェア' },
    // --- ルーティング ---
    { name: 'ルート追加', description: 'ルートを追加', signature: 'ルート追加(メソッド, パス, ステータス, タイプ, ボディ)', category: 'ルーティング' },
    { name: 'GET', description: 'GETルートを追加', signature: 'GET(パス, ボディ|コールバック)', category: 'ルーティング' },
    { name: 'POST', description: 'POSTルートを追加', signature: 'POST(パス, ボディ|コールバック)', category: 'ルーティング' },
    { name: 'PUT', description: 'PUTルートを追加', signature: 'PUT(パス, ボディ|コールバック)', category: 'ルーティング' },
    { name: 'DELETE', description: 'DELETEルートを追加', signature: 'DELETE(パス, ボディ|コールバック)', category: 'ルーティング' },
    { name: 'PATCH', description: 'PATCHルートを追加', signature: 'PATCH(パス, ボディ|コールバック)', category: 'ルーティング' },
    { name: 'ALL', description: '全メソッドのルートを追加', signature: 'ALL(パス, ボディ|コールバック)', category: 'ルーティング' },
    { name: 'JSON応答', description: 'JSON応答ルートを追加', signature: 'JSON応答(メソッド, パス, JSON)', category: 'ルーティング' },
    { name: 'JSON_POST', description: 'JSON POST応答', signature: 'JSON_POST(パス, ステータス, JSON)', category: 'ルーティング' },
    { name: 'ルート一覧', description: 'ルート一覧を取得', signature: 'ルート一覧()', category: 'ルーティング' },
    { name: 'グループ', description: 'ルートグループを開始', signature: 'グループ(プレフィックス)', category: 'ルーティング' },
    { name: 'グループ終了', description: 'ルートグループを終了', signature: 'グループ終了()', category: 'ルーティング' },
    { name: 'マウント', description: 'ルートをマウント', signature: 'マウント(プレフィックス, ルート配列)', category: 'ルーティング' },
    // --- レスポンス ---
    { name: 'JSON送信', description: 'JSONレスポンスを送信', signature: 'JSON送信(データ)', category: 'レスポンス' },
    { name: 'テキスト送信', description: 'テキストレスポンスを送信', signature: 'テキスト送信(テキスト)', category: 'レスポンス' },
    { name: 'HTML送信', description: 'HTMLレスポンスを送信', signature: 'HTML送信(HTML)', category: 'レスポンス' },
    { name: 'ファイル送信', description: 'ファイルを送信', signature: 'ファイル送信(パス)', category: 'レスポンス' },
    { name: 'リダイレクト応答', description: 'リダイレクトレスポンス', signature: 'リダイレクト応答(パス, ステータス?)', category: 'レスポンス' },
    { name: 'リダイレクト', description: 'リダイレクト', signature: 'リダイレクト(パス)', category: 'レスポンス' },
    { name: 'ヘッダー設定', description: 'レスポンスヘッダーを設定', signature: 'ヘッダー設定(キー, 値)', category: 'レスポンス' },
    { name: 'ステータス設定', description: 'HTTPステータスを設定', signature: 'ステータス設定(コード)', category: 'レスポンス' },
    { name: 'コンテンツタイプ設定', description: 'Content-Typeを設定', signature: 'コンテンツタイプ設定(タイプ)', category: 'レスポンス' },
    { name: 'ダウンロード', description: 'ファイルダウンロードレスポンス', signature: 'ダウンロード(パス, ファイル名?)', category: 'レスポンス' },
    // --- Cookie/セッション ---
    { name: 'Cookie設定', description: 'Cookieを設定', signature: 'Cookie設定(名前, 値, オプション?)', category: 'Cookie' },
    { name: 'Cookie削除', description: 'Cookieを削除', signature: 'Cookie削除(名前)', category: 'Cookie' },
    { name: 'セッション取得', description: 'セッション値を取得', signature: 'セッション取得(キー)', category: 'セッション' },
    { name: 'セッション設定', description: 'セッション値を設定', signature: 'セッション設定(キー, 値)', category: 'セッション' },
    { name: 'セッション削除', description: 'セッション値を削除', signature: 'セッション削除(キー)', category: 'セッション' },
    { name: 'セッション破棄', description: 'セッションを破棄', signature: 'セッション破棄()', category: 'セッション' },
    // --- テンプレート ---
    { name: 'テンプレートディレクトリ', description: 'テンプレートディレクトリを設定', signature: 'テンプレートディレクトリ(パス)', category: 'テンプレート' },
    { name: 'テンプレート変数', description: 'テンプレート変数を設定', signature: 'テンプレート変数(キー, 値)', category: 'テンプレート' },
    { name: 'テンプレート描画', description: 'テンプレートをレンダリング', signature: 'テンプレート描画(ファイル名)', category: 'テンプレート' },
    { name: 'テンプレート文字列', description: 'テンプレート文字列をレンダリング', signature: 'テンプレート文字列(テンプレート)', category: 'テンプレート' },
    { name: 'テンプレートGET', description: 'テンプレートGETルート', signature: 'テンプレートGET(パス, ファイル)', category: 'テンプレート' },
    // --- JSON ---
    { name: 'JSON解析', description: 'JSON文字列をパース', signature: 'JSON解析(文字列)', category: 'JSON' },
    { name: 'JSON生成', description: '値をJSON文字列に変換', signature: 'JSON生成(値)', category: 'JSON' },
    // --- エラー ---
    { name: 'エラーページ', description: 'HTMLエラーページを設定', signature: 'エラーページ(ステータス, タイトル, メッセージ)', category: 'エラー' },
    { name: 'JSONエラーページ', description: 'JSONエラーページを設定', signature: 'JSONエラーページ(ステータス, メッセージ)', category: 'エラー' },
    { name: 'エラーハンドラ', description: 'エラーハンドラ関数を設定', signature: 'エラーハンドラ(関数)', category: 'エラー' },
    // --- 静的ファイル ---
    { name: '静的ファイル', description: '静的ファイルディレクトリを設定', signature: '静的ファイル(パス)', category: '静的ファイル' },
    { name: '静的キャッシュ', description: 'キャッシュ秒数を設定', signature: '静的キャッシュ(秒)', category: '静的ファイル' },
    // --- CORS ---
    { name: 'CORS有効', description: 'CORSを有効化', signature: 'CORS有効()', category: 'セキュリティ' },
    { name: 'CORS設定', description: 'CORSの詳細設定', signature: 'CORS設定(Origin?, Methods?, Headers?)', category: 'セキュリティ' },
    { name: 'レート制限設定', description: 'レートリミッタの設定', signature: 'レート制限設定(最大数, ウィンドウ秒?)', category: 'セキュリティ' },
    { name: 'HTTPS設定', description: 'HTTPS設定', signature: 'HTTPS設定(証明書パス, キーパス)', category: 'セキュリティ' },
    // --- SSE ---
    { name: 'SSE', description: 'Server-Sent Eventsを設定', signature: 'SSE(パス)', category: 'リアルタイム' },
    { name: 'SSE送信', description: 'SSEイベントを送信', signature: 'SSE送信(イベント, データ)', category: 'リアルタイム' },
    { name: 'SSEブロードキャスト', description: 'SSEブロードキャスト', signature: 'SSEブロードキャスト(イベント, データ)', category: 'リアルタイム' },
    // --- バリデーション ---
    { name: 'バリデーション', description: 'リクエストバリデーション', signature: 'バリデーション(ルール)', category: 'バリデーション' },
    // --- アップロード ---
    { name: 'アップロード保存', description: 'アップロードファイルを保存', signature: 'アップロード保存(フィールド名, パス)', category: 'アップロード' },
    { name: 'アップロード最大サイズ', description: 'アップロード最大サイズを設定', signature: 'アップロード最大サイズ(バイト)', category: 'アップロード' },
    { name: 'アップロードディレクトリ', description: 'アップロード先ディレクトリ', signature: 'アップロードディレクトリ(パス)', category: 'アップロード' },
];

// ============================================================
// hajimu_discord プラグイン (242 関数)
// ============================================================
const DISCORD_FUNCTIONS: PluginFuncInfo[] = [
    // --- ボット管理 ---
    { name: 'ボット作成', description: 'Discordボットを作成', signature: 'ボット作成(トークン)', category: 'ボット管理' },
    { name: 'ボット起動', description: 'ボットを起動', signature: 'ボット起動()', category: 'ボット管理' },
    { name: 'ボット停止', description: 'ボットを停止', signature: 'ボット停止()', category: 'ボット管理' },
    { name: 'インテント設定', description: 'インテントを設定', signature: 'インテント設定(インテント配列)', category: 'ボット管理' },
    { name: 'ステータス設定', description: 'ボットのステータスを設定', signature: 'ステータス設定(タイプ, テキスト)', category: 'ボット管理' },
    { name: '自分情報', description: 'ボット自身の情報を取得', signature: '自分情報()', category: 'ボット管理' },
    { name: 'バージョン', description: 'プラグインバージョン', signature: 'バージョン()', category: 'ボット管理' },
    // --- イベント ---
    { name: 'イベント', description: 'イベントハンドラを登録', signature: 'イベント(イベント名, コールバック)', category: 'イベント' },
    { name: '準備完了時', description: 'ボット準備完了イベント', signature: '準備完了時(コールバック)', category: 'イベント' },
    { name: 'メッセージ受信時', description: 'メッセージ受信イベント', signature: 'メッセージ受信時(コールバック)', category: 'イベント' },
    { name: 'コマンド受信時', description: 'スラッシュコマンド受信', signature: 'コマンド受信時(コールバック)', category: 'イベント' },
    { name: '参加時', description: 'メンバー参加イベント', signature: '参加時(コールバック)', category: 'イベント' },
    { name: '退出時', description: 'メンバー退出イベント', signature: '退出時(コールバック)', category: 'イベント' },
    { name: 'リアクション時', description: 'リアクションイベント', signature: 'リアクション時(コールバック)', category: 'イベント' },
    { name: 'エラー時', description: 'エラーイベント', signature: 'エラー時(コールバック)', category: 'イベント' },
    // --- メッセージ ---
    { name: 'メッセージ送信', description: 'メッセージを送信', signature: 'メッセージ送信(チャンネルID, 内容)', category: 'メッセージ' },
    { name: '返信', description: 'メッセージに返信', signature: '返信(メッセージ, 内容)', category: 'メッセージ' },
    { name: 'メッセージ編集', description: 'メッセージを編集', signature: 'メッセージ編集(メッセージID, 新内容)', category: 'メッセージ' },
    { name: 'メッセージ削除', description: 'メッセージを削除', signature: 'メッセージ削除(メッセージID)', category: 'メッセージ' },
    { name: '一括削除', description: 'メッセージを一括削除', signature: '一括削除(チャンネルID, 件数)', category: 'メッセージ' },
    // --- 埋め込み ---
    { name: '埋め込み作成', description: '埋め込みメッセージを作成', signature: '埋め込み作成()', category: '埋め込み' },
    { name: '埋め込みタイトル', description: '埋め込みのタイトルを設定', signature: '埋め込みタイトル(埋め込み, タイトル)', category: '埋め込み' },
    { name: '埋め込み説明', description: '埋め込みの説明を設定', signature: '埋め込み説明(埋め込み, 説明)', category: '埋め込み' },
    { name: '埋め込み色', description: '埋め込みの色を設定', signature: '埋め込み色(埋め込み, 色)', category: '埋め込み' },
    { name: '埋め込みフィールド', description: 'フィールドを追加', signature: '埋め込みフィールド(埋め込み, 名前, 値, インライン?)', category: '埋め込み' },
    { name: '埋め込みフッター', description: 'フッターを設定', signature: '埋め込みフッター(埋め込み, テキスト)', category: '埋め込み' },
    { name: '埋め込みサムネイル', description: 'サムネイルを設定', signature: '埋め込みサムネイル(埋め込み, URL)', category: '埋め込み' },
    { name: '埋め込み画像', description: '画像を設定', signature: '埋め込み画像(埋め込み, URL)', category: '埋め込み' },
    { name: '埋め込み著者', description: '著者を設定', signature: '埋め込み著者(埋め込み, 名前, URL?)', category: '埋め込み' },
    { name: '埋め込みタイムスタンプ', description: 'タイムスタンプを設定', signature: '埋め込みタイムスタンプ(埋め込み)', category: '埋め込み' },
    { name: '埋め込み送信', description: '埋め込みメッセージを送信', signature: '埋め込み送信(チャンネルID, 埋め込み)', category: '埋め込み' },
    // --- コマンド ---
    { name: 'コマンド登録', description: 'スラッシュコマンドを登録', signature: 'コマンド登録(名前, 説明)', category: 'コマンド' },
    { name: 'コマンドオプション', description: 'コマンドオプションを追加', signature: 'コマンドオプション(コマンド, 名前, タイプ, 説明, 必須?)', category: 'コマンド' },
    { name: 'コマンド応答', description: 'コマンドに応答', signature: 'コマンド応答(インタラクション, 内容)', category: 'コマンド' },
    { name: 'コマンド遅延応答', description: 'コマンドに遅延応答', signature: 'コマンド遅延応答(インタラクション)', category: 'コマンド' },
    { name: 'コマンドフォローアップ', description: 'フォローアップ応答', signature: 'コマンドフォローアップ(インタラクション, 内容)', category: 'コマンド' },
    // --- UI コンポーネント ---
    { name: 'ボタン作成', description: 'ボタンを作成', signature: 'ボタン作成(ID, ラベル, スタイル?)', category: 'UIコンポーネント' },
    { name: 'リンクボタン作成', description: 'リンクボタンを作成', signature: 'リンクボタン作成(URL, ラベル)', category: 'UIコンポーネント' },
    { name: 'アクション行作成', description: 'アクション行を作成', signature: 'アクション行作成()', category: 'UIコンポーネント' },
    { name: 'セレクトメニュー作成', description: 'セレクトメニューを作成', signature: 'セレクトメニュー作成(ID, プレースホルダ?)', category: 'UIコンポーネント' },
    { name: 'メニュー選択肢', description: 'メニューに選択肢を追加', signature: 'メニュー選択肢(メニュー, ラベル, 値, 説明?)', category: 'UIコンポーネント' },
    { name: 'コンポーネント送信', description: 'UIコンポーネントを送信', signature: 'コンポーネント送信(チャンネルID, 内容, コンポーネント)', category: 'UIコンポーネント' },
    { name: 'モーダル作成', description: 'モーダルを作成', signature: 'モーダル作成(ID, タイトル)', category: 'UIコンポーネント' },
    { name: 'テキスト入力追加', description: 'モーダルにテキスト入力を追加', signature: 'テキスト入力追加(モーダル, ID, ラベル, スタイル?)', category: 'UIコンポーネント' },
    { name: 'モーダル表示', description: 'モーダルを表示', signature: 'モーダル表示(インタラクション, モーダル)', category: 'UIコンポーネント' },
    // --- チャンネル ---
    { name: 'チャンネル情報', description: 'チャンネル情報を取得', signature: 'チャンネル情報(チャンネルID)', category: 'チャンネル' },
    { name: 'チャンネル一覧', description: 'チャンネル一覧を取得', signature: 'チャンネル一覧(サーバーID)', category: 'チャンネル' },
    { name: 'チャンネル作成', description: 'チャンネルを作成', signature: 'チャンネル作成(サーバーID, 名前, タイプ?)', category: 'チャンネル' },
    { name: 'チャンネル削除', description: 'チャンネルを削除', signature: 'チャンネル削除(チャンネルID)', category: 'チャンネル' },
    { name: 'スレッド作成', description: 'スレッドを作成', signature: 'スレッド作成(チャンネルID, 名前)', category: 'チャンネル' },
    // --- メンバー管理 ---
    { name: 'メンバー一覧', description: 'メンバー一覧を取得', signature: 'メンバー一覧(サーバーID)', category: 'メンバー管理' },
    { name: 'メンバー情報', description: 'メンバー情報を取得', signature: 'メンバー情報(サーバーID, ユーザーID)', category: 'メンバー管理' },
    { name: 'キック', description: 'メンバーをキック', signature: 'キック(サーバーID, ユーザーID, 理由?)', category: 'メンバー管理' },
    { name: 'BAN', description: 'メンバーをBAN', signature: 'BAN(サーバーID, ユーザーID, 理由?)', category: 'メンバー管理' },
    { name: 'BAN解除', description: 'BANを解除', signature: 'BAN解除(サーバーID, ユーザーID)', category: 'メンバー管理' },
    { name: 'タイムアウト', description: 'メンバーをタイムアウト', signature: 'タイムアウト(サーバーID, ユーザーID, 秒)', category: 'メンバー管理' },
    { name: 'ロール付与', description: 'ロールを付与', signature: 'ロール付与(サーバーID, ユーザーID, ロールID)', category: 'メンバー管理' },
    { name: 'ロール剥奪', description: 'ロールを剥奪', signature: 'ロール剥奪(サーバーID, ユーザーID, ロールID)', category: 'メンバー管理' },
    // --- 音声 ---
    { name: 'VC接続', description: 'ボイスチャンネルに接続', signature: 'VC接続(チャンネルID)', category: '音声' },
    { name: 'VC切断', description: 'ボイスチャンネルから切断', signature: 'VC切断()', category: '音声' },
    { name: '音声再生', description: '音声ファイルを再生', signature: '音声再生(パス|URL)', category: '音声' },
    { name: '音声停止', description: '音声再生を停止', signature: '音声停止()', category: '音声' },
    { name: '音声一時停止', description: '音声を一時停止', signature: '音声一時停止()', category: '音声' },
    { name: '音声再開', description: '音声を再開', signature: '音声再開()', category: '音声' },
    { name: '音声スキップ', description: '現在の曲をスキップ', signature: '音声スキップ()', category: '音声' },
    { name: '音声キュー', description: 'キューに曲を追加', signature: '音声キュー(パス|URL)', category: '音声' },
    { name: '音声ループ', description: 'ループ再生を切替', signature: '音声ループ(有効?)', category: '音声' },
    { name: '音声音量', description: '音量を設定', signature: '音声音量(0-100)', category: '音声' },
    // --- YouTube ---
    { name: 'YouTube検索', description: 'YouTube検索', signature: 'YouTube検索(クエリ)', category: 'YouTube' },
    { name: 'YouTube情報', description: 'YouTube動画情報を取得', signature: 'YouTube情報(URL)', category: 'YouTube' },
    { name: 'YouTubeタイトル', description: 'YouTube動画タイトルを取得', signature: 'YouTubeタイトル(URL)', category: 'YouTube' },
    // --- Webhook ---
    { name: 'Webhook作成', description: 'Webhookを作成', signature: 'Webhook作成(チャンネルID, 名前)', category: 'Webhook' },
    { name: 'Webhook送信', description: 'Webhookでメッセージを送信', signature: 'Webhook送信(WebhookID, 内容)', category: 'Webhook' },
    { name: 'Webhook一覧', description: 'Webhook一覧を取得', signature: 'Webhook一覧(チャンネルID)', category: 'Webhook' },
    { name: 'Webhook削除', description: 'Webhookを削除', signature: 'Webhook削除(WebhookID)', category: 'Webhook' },
    // --- マークダウン ---
    { name: '太字', description: 'テキストを太字に', signature: '太字(テキスト)', category: 'マークダウン' },
    { name: '斜体', description: 'テキストを斜体に', signature: '斜体(テキスト)', category: 'マークダウン' },
    { name: '下線', description: 'テキストに下線', signature: '下線(テキスト)', category: 'マークダウン' },
    { name: '取り消し線', description: 'テキストに取り消し線', signature: '取り消し線(テキスト)', category: 'マークダウン' },
    { name: 'コード', description: 'インラインコード', signature: 'コード(テキスト)', category: 'マークダウン' },
    { name: 'コードブロック', description: 'コードブロック', signature: 'コードブロック(テキスト, 言語?)', category: 'マークダウン' },
    { name: 'スポイラー', description: 'スポイラーテキスト', signature: 'スポイラー(テキスト)', category: 'マークダウン' },
    { name: 'ユーザーメンション', description: 'ユーザーメンション', signature: 'ユーザーメンション(ユーザーID)', category: 'マークダウン' },
    { name: 'チャンネルメンション', description: 'チャンネルメンション', signature: 'チャンネルメンション(チャンネルID)', category: 'マークダウン' },
    { name: 'ロールメンション', description: 'ロールメンション', signature: 'ロールメンション(ロールID)', category: 'マークダウン' },
    { name: 'タイムスタンプ', description: 'タイムスタンプフォーマット', signature: 'タイムスタンプ(UNIX時間, スタイル?)', category: 'マークダウン' },
    // --- リアクション ---
    { name: 'リアクション追加', description: 'リアクションを追加', signature: 'リアクション追加(メッセージID, 絵文字)', category: 'リアクション' },
    { name: 'リアクション削除', description: 'リアクションを削除', signature: 'リアクション削除(メッセージID, 絵文字)', category: 'リアクション' },
    { name: 'リアクション全削除', description: '全リアクションを削除', signature: 'リアクション全削除(メッセージID)', category: 'リアクション' },
    // --- ロール ---
    { name: 'ロール作成', description: 'ロールを作成', signature: 'ロール作成(サーバーID, 名前, 色?)', category: 'ロール' },
    { name: 'ロール編集', description: 'ロールを編集', signature: 'ロール編集(ロールID, オプション)', category: 'ロール' },
    { name: 'ロール削除', description: 'ロールを削除', signature: 'ロール削除(ロールID)', category: 'ロール' },
    { name: 'ロール一覧', description: 'ロール一覧を取得', signature: 'ロール一覧(サーバーID)', category: 'ロール' },
    // --- 招待 ---
    { name: '招待作成', description: '招待を作成', signature: '招待作成(チャンネルID, オプション?)', category: '招待' },
    { name: '招待一覧', description: '招待一覧を取得', signature: '招待一覧(サーバーID)', category: '招待' },
    { name: '招待削除', description: '招待を削除', signature: '招待削除(コード)', category: '招待' },
    // --- ピン ---
    { name: 'ピン留め', description: 'メッセージをピン留め', signature: 'ピン留め(メッセージID)', category: 'メッセージ' },
    { name: 'ピン解除', description: 'ピン留めを解除', signature: 'ピン解除(メッセージID)', category: 'メッセージ' },
    { name: 'ピン一覧', description: 'ピン留め一覧を取得', signature: 'ピン一覧(チャンネルID)', category: 'メッセージ' },
    // --- env ---
    { name: 'env読み込み', description: '.envファイルを読み込み', signature: 'env読み込み(パス?)', category: 'ユーティリティ' },
    { name: 'env取得', description: '環境変数を取得', signature: 'env取得(キー, デフォルト?)', category: 'ユーティリティ' },
    // --- ファイル/DM ---
    { name: 'ファイル送信', description: 'ファイルを送信', signature: 'ファイル送信(チャンネルID, パス)', category: 'メッセージ' },
    { name: 'DM作成', description: 'DMチャンネルを作成', signature: 'DM作成(ユーザーID)', category: 'メッセージ' },
    // --- AutoMod ---
    { name: 'AutoModルール作成', description: 'AutoModルールを作成', signature: 'AutoModルール作成(サーバーID, 名前, タイプ)', category: 'AutoMod' },
    { name: 'AutoModルール一覧', description: 'AutoModルール一覧', signature: 'AutoModルール一覧(サーバーID)', category: 'AutoMod' },
    { name: 'AutoModルール削除', description: 'AutoModルールを削除', signature: 'AutoModルール削除(サーバーID, ルールID)', category: 'AutoMod' },
];

// ============================================================
// エクスポート
// ============================================================
export const PLUGINS: PluginInfo[] = [
    {
        pluginName: 'hajimu_gui',
        displayName: 'GUI',
        version: '13.0.0',
        commonAliases: ['GUI', 'gui', '画面', 'Gui'],
        description: 'GUIアプリケーション開発プラグイン (1,074関数)',
        functions: GUI_FUNCTIONS,
    },
    {
        pluginName: 'hajimu_web',
        displayName: 'ウェブ',
        version: '5.4.0',
        commonAliases: ['ウェブ', 'Web', 'web', 'サーバー'],
        description: 'Webサーバー開発プラグイン (94関数)',
        functions: WEB_FUNCTIONS,
    },
    {
        pluginName: 'hajimu_discord',
        displayName: 'ディスコード',
        version: '2.3.0',
        commonAliases: ['ディスコード', 'ボット', 'Discord', 'discord', 'Bot'],
        description: 'Discord Bot開発プラグイン (242関数)',
        functions: DISCORD_FUNCTIONS,
    },
];

/** プラグイン名から PluginInfo を検索 */
export function findPluginByAlias(alias: string): PluginInfo | undefined {
    return PLUGINS.find(p =>
        p.pluginName === alias ||
        p.displayName === alias ||
        p.commonAliases.includes(alias)
    );
}

/** 取り込む文を解析してエイリアス→プラグインのマッピングを返す */
export function parseImports(text: string): Map<string, PluginInfo> {
    const map = new Map<string, PluginInfo>();
    const regex = /取り込む\s+"([^"]+)"\s+として\s+([\p{L}\p{N}_]+)/gu;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const pluginName = match[1];
        const alias = match[2];
        const plugin = PLUGINS.find(p => p.pluginName === pluginName);
        if (plugin) {
            map.set(alias, plugin);
        }
    }
    return map;
}
