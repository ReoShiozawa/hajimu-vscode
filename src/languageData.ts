export interface BuiltinInfo {
    name: string;
    description: string;
    signature: string;
    category: string;
}

export interface KeywordInfo {
    name: string;
    description: string;
    detail: string;
}

export const KEYWORDS: KeywordInfo[] = [
    // 変数・定数
    { name: '変数', description: 'ミュータブルな変数を宣言する', detail: '変数 名前 = 値' },
    { name: '定数', description: 'イミュータブルな定数を宣言する', detail: '定数 名前 = 値' },
    // 関数
    { name: '関数', description: '関数を定義する', detail: '関数 名前(引数):\n    処理\n終わり' },
    { name: '戻す', description: '関数から値を返す', detail: '戻す 値' },
    { name: '終わり', description: 'ブロックを終了する', detail: 'もし/関数/型 の終端' },
    // 条件分岐
    { name: 'もし', description: '条件分岐（if文）', detail: 'もし 条件 なら\n    処理\n終わり' },
    { name: 'なら', description: '条件分岐のthen', detail: 'もし 条件 なら' },
    { name: 'それ以外もし', description: 'else if 分岐', detail: 'それ以外もし 条件 なら' },
    { name: 'それ以外', description: 'else 分岐', detail: 'それ以外\n    処理' },
    // ループ
    { name: '繰り返す', description: 'カウンタ繰り返し（for文）', detail: 'i を 0 から 9 繰り返す\n    処理\n終わり' },
    { name: '条件', description: '条件繰り返し（while文）', detail: '条件 式 の間\n    処理\n終わり' },
    { name: 'の間', description: 'while文の終端マーカー', detail: '条件 式 の間' },
    { name: 'から', description: 'forループの開始値', detail: 'i を 0 から 9 繰り返す' },
    { name: 'を', description: 'forループの変数指定', detail: 'i を 0 から 9 繰り返す' },
    { name: '抜ける', description: 'ループを抜ける（break）', detail: 'ループ内で使用' },
    { name: '続ける', description: '次の反復に進む（continue）', detail: 'ループ内で使用' },
    // クラス
    { name: '型', description: 'クラスを定義する', detail: '型 クラス名:\n    初期化(引数):\n        処理\n    終わり\n終わり' },
    { name: '新規', description: 'インスタンスを作成する（new）', detail: '変数 obj = 新規 クラス名(引数)' },
    { name: '継承', description: 'クラスを継承する', detail: '型 子クラス 継承 親クラス:' },
    { name: '自分', description: 'インスタンス自身を参照（this/self）', detail: '自分.属性' },
    { name: '初期化', description: 'コンストラクタ', detail: '初期化(引数):\n    自分.属性 = 値\n終わり' },
    { name: '親', description: '親クラスを参照（super）', detail: '親.メソッド()' },
    { name: '静的', description: '静的メソッド/プロパティ', detail: '静的 関数 メソッド名():' },
    // 例外処理
    { name: '試行', description: '例外処理ブロック（try）', detail: '試行:\n    処理\n捕獲 エラー:\n    エラー処理\n終わり' },
    { name: '捕獲', description: '例外をキャッチする（catch）', detail: '捕獲 エラー変数:' },
    { name: '最終', description: '必ず実行するブロック（finally）', detail: '最終:\n    処理\n終わり' },
    { name: '投げる', description: '例外をスローする（throw）', detail: '投げる "エラーメッセージ"' },
    // 列挙・パターンマッチ
    { name: '列挙', description: '列挙型を定義する', detail: '列挙 名前:\n    値1\n    値2\n終わり' },
    { name: '照合', description: 'パターンマッチング（match）', detail: '照合 値:\n    パターン => 処理\n終わり' },
    // switch
    { name: '選択', description: '選択文（switch）', detail: '選択 値:\n    場合 値1:\n        処理\n    既定:\n        処理\n終わり' },
    { name: '場合', description: 'ケース（case）', detail: '場合 値:' },
    { name: '既定', description: 'デフォルト（default）', detail: '既定:' },
    // foreach
    { name: '各', description: '要素ごとの繰り返し（foreach）', detail: '配列 を 要素 で繰り返す' },
    { name: 'の中', description: 'foreach文のin', detail: '配列 を 要素 の中 で繰り返す' },
    // その他
    { name: '取り込む', description: 'モジュールを読み込む（import）', detail: '取り込む("パス")' },
    { name: '生成関数', description: 'ジェネレータ関数を定義する', detail: '生成関数 名前():\n    譲渡 値\n終わり' },
    { name: '譲渡', description: 'ジェネレータから値を返す（yield）', detail: '譲渡 値' },
    // 論理演算子
    { name: 'かつ', description: '論理AND（&&）', detail: '条件1 かつ 条件2' },
    { name: 'または', description: '論理OR（||）', detail: '条件1 または 条件2' },
    { name: 'でない', description: '論理NOT（!）', detail: 'でない 条件' },
    // リテラル
    { name: '真', description: '真偽値 true', detail: 'Boolean true' },
    { name: '偽', description: '真偽値 false', detail: 'Boolean false' },
    { name: '無', description: 'null値', detail: 'null / nil' },
    // 数学定数
    { name: '円周率', description: '円周率 π = 3.14159...', detail: '3.14159265358979323846' },
    { name: '自然対数の底', description: 'ネイピア数 e = 2.71828...', detail: '2.71828182845904523536' },
];

export const BUILTIN_FUNCTIONS: BuiltinInfo[] = [
    // 入出力
    { name: '表示', description: 'コンソールに出力する', signature: '表示(値1, 値2, ...)', category: '入出力' },
    { name: '入力', description: 'ユーザー入力を受け取る', signature: '入力(プロンプト?)', category: '入出力' },
    // コレクション
    { name: '長さ', description: '配列や文字列の長さを取得', signature: '長さ(コレクション)', category: 'コレクション' },
    { name: '追加', description: '配列に要素を追加', signature: '追加(配列, 要素)', category: 'コレクション' },
    { name: '削除', description: '配列から要素を削除', signature: '削除(配列, インデックス)', category: 'コレクション' },
    // 型変換
    { name: '数値化', description: '値を数値に変換', signature: '数値化(値)', category: '型変換' },
    { name: '文字列化', description: '値を文字列に変換', signature: '文字列化(値)', category: '型変換' },
    // 型チェック
    { name: '数値か', description: '数値かどうか判定', signature: '数値か(値) → 真偽', category: '型チェック' },
    { name: '文字列か', description: '文字列かどうか判定', signature: '文字列か(値) → 真偽', category: '型チェック' },
    { name: '真偽か', description: '真偽値かどうか判定', signature: '真偽か(値) → 真偽', category: '型チェック' },
    { name: '配列か', description: '配列かどうか判定', signature: '配列か(値) → 真偽', category: '型チェック' },
    { name: '辞書か', description: '辞書かどうか判定', signature: '辞書か(値) → 真偽', category: '型チェック' },
    { name: '関数か', description: '関数かどうか判定', signature: '関数か(値) → 真偽', category: '型チェック' },
    { name: '無か', description: '無（null）かどうか判定', signature: '無か(値) → 真偽', category: '型チェック' },
    { name: '型判定', description: '型が一致するか判定', signature: '型判定(値, 型名)', category: '型チェック' },
    { name: '型別名', description: '型のエイリアスを定義', signature: '型別名(新名, 既存名)', category: '型チェック' },
    // 範囲
    { name: '範囲', description: '数値の範囲を生成', signature: '範囲(終了) / 範囲(開始, 終了) / 範囲(開始, 終了, ステップ)', category: '範囲' },
    // 文字列操作
    { name: '分割', description: '文字列を分割して配列にする', signature: '分割(文字列, 区切り)', category: '文字列' },
    { name: '結合', description: '配列を結合して文字列にする', signature: '結合(配列, 区切り)', category: '文字列' },
    { name: '検索', description: '文字列内を検索', signature: '検索(文字列, 検索語)', category: '文字列' },
    { name: '置換', description: '文字列を置換', signature: '置換(文字列, 対象, 置換後)', category: '文字列' },
    { name: '大文字', description: '大文字に変換', signature: '大文字(文字列)', category: '文字列' },
    { name: '小文字', description: '小文字に変換', signature: '小文字(文字列)', category: '文字列' },
    { name: '空白除去', description: '前後の空白を除去', signature: '空白除去(文字列)', category: '文字列' },
    { name: '部分文字列', description: '部分文字列を取得', signature: '部分文字列(文字列, 開始, 終了?)', category: '文字列' },
    { name: '始まる', description: '指定文字列で始まるか判定', signature: '始まる(文字列, 接頭辞)', category: '文字列' },
    { name: '終わる', description: '指定文字列で終わるか判定', signature: '終わる(文字列, 接尾辞)', category: '文字列' },
    { name: '文字コード', description: '文字のコードポイントを取得', signature: '文字コード(文字列, 位置?)', category: '文字列' },
    { name: 'コード文字', description: 'コードポイントから文字を取得', signature: 'コード文字(コード)', category: '文字列' },
    { name: '繰り返し', description: '文字列を繰り返す', signature: '繰り返し(文字列, 回数)', category: '文字列' },
    // 配列操作
    { name: 'ソート', description: '配列をソート', signature: 'ソート(配列)', category: '配列' },
    { name: '逆順', description: '配列を逆順にする', signature: '逆順(配列)', category: '配列' },
    { name: 'スライス', description: '配列の一部を取得', signature: 'スライス(配列, 開始, 終了?)', category: '配列' },
    { name: '位置', description: '要素のインデックスを取得', signature: '位置(配列, 要素)', category: '配列' },
    { name: '存在', description: '要素が存在するか判定', signature: '存在(配列, 要素)', category: '配列' },
    { name: '末尾削除', description: '配列の末尾を削除', signature: '末尾削除(配列)', category: '配列' },
    { name: '探す', description: '条件に合う要素を探す', signature: '探す(配列, 関数)', category: '配列' },
    { name: '全て', description: '全要素が条件を満たすか', signature: '全て(配列, 関数)', category: '配列' },
    { name: '一つでも', description: 'いずれかが条件を満たすか', signature: '一つでも(配列, 関数)', category: '配列' },
    { name: '一意', description: '重複を除去', signature: '一意(配列)', category: '配列' },
    { name: '圧縮', description: '2つの配列をペアにする', signature: '圧縮(配列1, 配列2)', category: '配列' },
    { name: '平坦化', description: 'ネストされた配列を平坦化', signature: '平坦化(配列)', category: '配列' },
    { name: '挿入', description: '配列に要素を挿入', signature: '挿入(配列, 位置, 要素)', category: '配列' },
    { name: '比較ソート', description: '比較関数でソート', signature: '比較ソート(配列, 比較関数)', category: '配列' },
    // 高階関数
    { name: '変換', description: '配列の全要素を変換（map）', signature: '変換(配列, 関数)', category: '高階関数' },
    { name: '抽出', description: '条件に合う要素を抽出（filter）', signature: '抽出(配列, 関数)', category: '高階関数' },
    { name: '集約', description: '配列を単一の値に集約（reduce）', signature: '集約(配列, 初期値, 関数)', category: '高階関数' },
    { name: '反復', description: '全要素に対して処理を実行（forEach）', signature: '反復(配列, 関数)', category: '高階関数' },
    // 数学
    { name: '絶対値', description: '絶対値を取得', signature: '絶対値(数値)', category: '数学' },
    { name: '平方根', description: '平方根を計算', signature: '平方根(数値)', category: '数学' },
    { name: '切り捨て', description: '小数点以下を切り捨て', signature: '切り捨て(数値)', category: '数学' },
    { name: '切り上げ', description: '小数点以下を切り上げ', signature: '切り上げ(数値)', category: '数学' },
    { name: '四捨五入', description: '四捨五入する', signature: '四捨五入(数値)', category: '数学' },
    { name: '乱数', description: '0〜1のランダムな数値', signature: '乱数()', category: '数学' },
    { name: '乱数整数', description: '指定範囲のランダムな整数', signature: '乱数整数(最小, 最大)', category: '数学' },
    { name: '最大', description: '最大値を取得', signature: '最大(値1, 値2, ...)', category: '数学' },
    { name: '最小', description: '最小値を取得', signature: '最小(値1, 値2, ...)', category: '数学' },
    { name: '正弦', description: 'sin(x)を計算', signature: '正弦(ラジアン)', category: '数学' },
    { name: '余弦', description: 'cos(x)を計算', signature: '余弦(ラジアン)', category: '数学' },
    { name: '正接', description: 'tan(x)を計算', signature: '正接(ラジアン)', category: '数学' },
    { name: '対数', description: '自然対数を計算', signature: '対数(数値)', category: '数学' },
    { name: '常用対数', description: '常用対数（log10）を計算', signature: '常用対数(数値)', category: '数学' },
    // 辞書
    { name: 'キー', description: '辞書のキー一覧を取得', signature: 'キー(辞書)', category: '辞書' },
    { name: '値一覧', description: '辞書の値一覧を取得', signature: '値一覧(辞書)', category: '辞書' },
    { name: '含む', description: '辞書にキーが含まれるか判定', signature: '含む(辞書, キー)', category: '辞書' },
    // ファイル
    { name: '読み込む', description: 'ファイルを読み込む', signature: '読み込む(パス)', category: 'ファイル' },
    { name: '書き込む', description: 'ファイルに書き込む', signature: '書き込む(パス, 内容)', category: 'ファイル' },
    { name: 'ファイル存在', description: 'ファイルが存在するか判定', signature: 'ファイル存在(パス)', category: 'ファイル' },
    { name: '追記', description: 'ファイルに追記する', signature: '追記(パス, 内容)', category: 'ファイル' },
    { name: 'ディレクトリ一覧', description: 'ディレクトリの内容を一覧表示', signature: 'ディレクトリ一覧(パス)', category: 'ファイル' },
    { name: 'ディレクトリ作成', description: 'ディレクトリを作成', signature: 'ディレクトリ作成(パス)', category: 'ファイル' },
    // パス操作
    { name: 'パス結合', description: 'パスを結合する', signature: 'パス結合(パス1, パス2)', category: 'ファイル' },
    { name: 'ファイル名', description: 'ファイル名を取得', signature: 'ファイル名(パス)', category: 'ファイル' },
    { name: 'ディレクトリ名', description: 'ディレクトリ名を取得', signature: 'ディレクトリ名(パス)', category: 'ファイル' },
    { name: '拡張子', description: '拡張子を取得', signature: '拡張子(パス)', category: 'ファイル' },
    // 日時
    { name: '現在時刻', description: '現在のタイムスタンプを取得', signature: '現在時刻()', category: '日時' },
    { name: '日付', description: '現在の日付を取得', signature: '日付(タイムスタンプ?)', category: '日時' },
    { name: '時間', description: '現在の時間を取得', signature: '時間(タイムスタンプ?)', category: '日時' },
    // JSON
    { name: 'JSON化', description: '値をJSON文字列に変換', signature: 'JSON化(値)', category: 'JSON' },
    { name: 'JSON解析', description: 'JSON文字列をパースする', signature: 'JSON解析(文字列)', category: 'JSON' },
    // HTTP
    { name: 'HTTP取得', description: 'HTTP GETリクエスト', signature: 'HTTP取得(URL, ヘッダー?)', category: 'HTTP' },
    { name: 'HTTP送信', description: 'HTTP POSTリクエスト', signature: 'HTTP送信(URL, データ?, ヘッダー?)', category: 'HTTP' },
    { name: 'HTTP更新', description: 'HTTP PUTリクエスト', signature: 'HTTP更新(URL, データ?, ヘッダー?)', category: 'HTTP' },
    { name: 'HTTP削除', description: 'HTTP DELETEリクエスト', signature: 'HTTP削除(URL, ヘッダー?)', category: 'HTTP' },
    { name: 'HTTPリクエスト', description: '汎用HTTPリクエスト', signature: 'HTTPリクエスト(メソッド, URL, データ?, ヘッダー?)', category: 'HTTP' },
    { name: 'サーバー起動', description: 'HTTPサーバーを起動', signature: 'サーバー起動(ポート, ハンドラ?)', category: 'HTTP' },
    { name: 'サーバー停止', description: 'HTTPサーバーを停止', signature: 'サーバー停止()', category: 'HTTP' },
    { name: 'URLエンコード', description: 'URLエンコードする', signature: 'URLエンコード(文字列)', category: 'HTTP' },
    { name: 'URLデコード', description: 'URLデコードする', signature: 'URLデコード(文字列)', category: 'HTTP' },
    // 正規表現
    { name: '正規一致', description: '正規表現でマッチング', signature: '正規一致(文字列, パターン)', category: '正規表現' },
    { name: '正規検索', description: '正規表現で検索', signature: '正規検索(文字列, パターン)', category: '正規表現' },
    { name: '正規置換', description: '正規表現で置換', signature: '正規置換(文字列, パターン, 置換後)', category: '正規表現' },
    // ビット演算
    { name: 'ビット積', description: 'ビット単位AND', signature: 'ビット積(値1, 値2)', category: 'ビット演算' },
    { name: 'ビット和', description: 'ビット単位OR', signature: 'ビット和(値1, 値2)', category: 'ビット演算' },
    { name: 'ビット排他', description: 'ビット単位XOR', signature: 'ビット排他(値1, 値2)', category: 'ビット演算' },
    { name: 'ビット否定', description: 'ビット単位NOT', signature: 'ビット否定(値)', category: 'ビット演算' },
    { name: '左シフト', description: '左ビットシフト', signature: '左シフト(値, ビット数)', category: 'ビット演算' },
    { name: '右シフト', description: '右ビットシフト', signature: '右シフト(値, ビット数)', category: 'ビット演算' },
    // 非同期
    { name: '非同期実行', description: '非同期でタスクを実行（スレッドプール使用）', signature: '非同期実行(関数, 引数...)', category: '非同期' },
    { name: '待機', description: 'タスクの完了を待つ（条件変数ベース、タイムアウト対応）', signature: '待機(タスクID, タイムアウト秒?)', category: '非同期' },
    { name: '全待機', description: '全タスクの完了を待つ', signature: '全待機(タスクID配列)', category: '非同期' },
    { name: 'タスク状態', description: 'タスクの状態を取得', signature: 'タスク状態(タスクID)', category: '非同期' },
    { name: '競争待機', description: '最初に完了したタスクの結果を返す', signature: '競争待機(タスクID配列)', category: '非同期' },
    { name: 'タスクキャンセル', description: '待機中のタスクをキャンセル', signature: 'タスクキャンセル(タスクID)', category: '非同期' },
    // Promiseチェーン
    { name: '成功時', description: 'タスク成功時のコールバックを設定（Promiseチェーン）', signature: '成功時(タスクID, 関数)', category: '非同期' },
    { name: '失敗時', description: 'タスク失敗時のコールバックを設定（Promiseチェーン）', signature: '失敗時(タスクID, 関数)', category: '非同期' },
    // スレッドプール
    { name: 'プール作成', description: 'スレッドプールを作成（ワーカー数指定）', signature: 'プール作成(ワーカー数?)', category: '非同期' },
    { name: 'プール情報', description: 'スレッドプールの統計情報を取得', signature: 'プール情報()', category: '非同期' },
    // 並列処理
    { name: '並列実行', description: '並列でタスクを実行', signature: '並列実行(関数配列)', category: '並列' },
    { name: '並列マップ', description: '配列の各要素に関数を並列適用', signature: '並列マップ(配列, 関数)', category: '並列' },
    { name: '排他作成', description: 'ミューテックスを作成', signature: '排他作成()', category: '並列' },
    { name: '排他実行', description: 'ミューテックスで排他実行', signature: '排他実行(ミューテックスID, 関数)', category: '並列' },
    // 読み書きロック
    { name: '読書ロック作成', description: '読み書きロックを作成', signature: '読書ロック作成()', category: '並列' },
    { name: '読取実行', description: '読み取りロック下で関数を実行', signature: '読取実行(ロックID, 関数)', category: '並列' },
    { name: '書込実行', description: '書き込みロック下で関数を実行', signature: '書込実行(ロックID, 関数)', category: '並列' },
    // セマフォ
    { name: 'セマフォ作成', description: 'セマフォを作成（同時実行数制限）', signature: 'セマフォ作成(上限数)', category: '並列' },
    { name: 'セマフォ獲得', description: 'セマフォを獲得（ブロッキング）', signature: 'セマフォ獲得(セマフォID)', category: '並列' },
    { name: 'セマフォ解放', description: 'セマフォを解放', signature: 'セマフォ解放(セマフォID)', category: '並列' },
    { name: 'セマフォ実行', description: 'セマフォ保護下で関数を実行', signature: 'セマフォ実行(セマフォID, 関数)', category: '並列' },
    // アトミックカウンター
    { name: 'カウンター作成', description: 'スレッドセーフなアトミックカウンターを作成', signature: 'カウンター作成(初期値?)', category: '並列' },
    { name: 'カウンター加算', description: 'カウンターに値を加算', signature: 'カウンター加算(カウンターID, 加算値?)', category: '並列' },
    { name: 'カウンター取得', description: 'カウンターの現在値を取得', signature: 'カウンター取得(カウンターID)', category: '並列' },
    { name: 'カウンター設定', description: 'カウンターの値を設定し旧値を返す', signature: 'カウンター設定(カウンターID, 値)', category: '並列' },
    // チャネル
    { name: 'チャネル作成', description: 'チャネルを作成', signature: 'チャネル作成(容量?)', category: 'チャネル' },
    { name: 'チャネル送信', description: 'チャネルにデータを送信（ブロッキング）', signature: 'チャネル送信(チャネルID, データ)', category: 'チャネル' },
    { name: 'チャネル受信', description: 'チャネルからデータを受信（ブロッキング）', signature: 'チャネル受信(チャネルID)', category: 'チャネル' },
    { name: 'チャネル閉じる', description: 'チャネルを閉じる', signature: 'チャネル閉じる(チャネルID)', category: 'チャネル' },
    { name: 'チャネル試送信', description: 'チャネルにデータを送信（非ブロッキング）', signature: 'チャネル試送信(チャネルID, データ)', category: 'チャネル' },
    { name: 'チャネル試受信', description: 'チャネルからデータを受信（非ブロッキング）', signature: 'チャネル試受信(チャネルID)', category: 'チャネル' },
    { name: 'チャネル残量', description: 'チャネルのバッファ内メッセージ数を取得', signature: 'チャネル残量(チャネルID)', category: 'チャネル' },
    { name: 'チャネル選択', description: '複数チャネルから最初に受信可能なものを選択', signature: 'チャネル選択(チャネルID配列, タイムアウト秒?)', category: 'チャネル' },
    // スケジューラ
    { name: '定期実行', description: '定期的に関数を実行', signature: '定期実行(ミリ秒, 関数)', category: 'スケジューラ' },
    { name: '遅延実行', description: '一定時間後に関数を実行', signature: '遅延実行(ミリ秒, 関数)', category: 'スケジューラ' },
    { name: 'スケジュール停止', description: 'スケジュールを停止', signature: 'スケジュール停止(ID)', category: 'スケジューラ' },
    { name: '全スケジュール停止', description: '全スケジュールを停止', signature: '全スケジュール停止()', category: 'スケジューラ' },
    // WebSocket
    { name: 'WS接続', description: 'WebSocketに接続', signature: 'WS接続(URL)', category: 'WebSocket' },
    { name: 'WS送信', description: 'WebSocketでデータを送信', signature: 'WS送信(接続, データ)', category: 'WebSocket' },
    { name: 'WS受信', description: 'WebSocketでデータを受信', signature: 'WS受信(接続, タイムアウト?)', category: 'WebSocket' },
    { name: 'WS切断', description: 'WebSocket接続を切断', signature: 'WS切断(接続)', category: 'WebSocket' },
    { name: 'WS状態', description: 'WebSocket接続状態を取得', signature: 'WS状態(接続)', category: 'WebSocket' },
    // ジェネレータ
    { name: '次', description: 'ジェネレータの次の値を取得', signature: '次(ジェネレータ)', category: 'ジェネレータ' },
    { name: '完了', description: 'ジェネレータが完了したか判定', signature: '完了(ジェネレータ)', category: 'ジェネレータ' },
    { name: '全値', description: 'ジェネレータの全値を取得', signature: '全値(ジェネレータ)', category: 'ジェネレータ' },
    // Base64
    { name: 'Base64エンコード', description: 'Base64エンコードする', signature: 'Base64エンコード(文字列)', category: 'エンコーディング' },
    { name: 'Base64デコード', description: 'Base64デコードする', signature: 'Base64デコード(文字列)', category: 'エンコーディング' },
    // 集合
    { name: '集合', description: '集合を作成', signature: '集合(要素1, 要素2, ...)', category: '集合' },
    { name: '集合追加', description: '集合に要素を追加', signature: '集合追加(集合, 要素)', category: '集合' },
    { name: '集合削除', description: '集合から要素を削除', signature: '集合削除(集合, 要素)', category: '集合' },
    { name: '集合含む', description: '集合に要素が含まれるか', signature: '集合含む(集合, 要素)', category: '集合' },
    { name: '和集合', description: '和集合を計算', signature: '和集合(集合1, 集合2)', category: '集合' },
    { name: '積集合', description: '積集合を計算', signature: '積集合(集合1, 集合2)', category: '集合' },
    { name: '差集合', description: '差集合を計算', signature: '差集合(集合1, 集合2)', category: '集合' },
    // テスト
    { name: 'テスト', description: 'テストケースを登録', signature: 'テスト(名前, 関数)', category: 'テスト' },
    { name: 'テスト実行', description: '全テストを実行', signature: 'テスト実行()', category: 'テスト' },
    { name: '期待', description: 'テストアサーション', signature: '期待(実際値, 期待値, メッセージ?)', category: 'テスト' },
    { name: '期待エラー', description: 'エラーが発生することを期待', signature: '期待エラー(関数)', category: 'テスト' },
    // ドキュメント
    { name: '文書化', description: 'ドキュメントコメントを設定', signature: '文書化(対象, 説明)', category: 'ドキュメント' },
    { name: '文書', description: 'ドキュメントコメントを取得', signature: '文書(対象)', category: 'ドキュメント' },
    { name: '例外作成', description: 'カスタム例外を作成', signature: '例外作成(名前, メッセージ)', category: '例外' },
    // システム
    { name: '待つ', description: '指定ミリ秒待機する', signature: '待つ(ミリ秒)', category: 'システム' },
    { name: '実行', description: 'シェルコマンドを実行', signature: '実行(コマンド文字列)', category: 'システム' },
    { name: '環境変数', description: '環境変数を取得', signature: '環境変数(名前)', category: 'システム' },
    { name: '環境変数設定', description: '環境変数を設定', signature: '環境変数設定(名前, 値)', category: 'システム' },
    { name: '終了', description: 'プログラムを終了', signature: '終了(コード?)', category: 'システム' },
    { name: '表明', description: 'アサーション', signature: '表明(条件, メッセージ?)', category: 'システム' },
];
