import type { PluginFuncInfo, PluginInfo } from './pluginData';

function makePluginFunctions(names: string[], category: string, descriptionPrefix: string): PluginFuncInfo[] {
    return names.map(name => ({
        name,
        description: `${descriptionPrefix}: ${name}`,
        signature: `${name}(...)`,
        category
    }));
}

const ENGINE_RENDER_FUNCTIONS: PluginFuncInfo[] = [
    ...makePluginFunctions([
        'ウィンドウ作成', 'ウィンドウ削除', 'ウィンドウ更新', 'ウィンドウ幅', 'ウィンドウ高さ',
        '経過時間', 'デルタ時間', 'FPS', 'フルスクリーン設定', 'カーソル表示設定'
    ], 'ウィンドウ', 'engine_render ウィンドウ機能'),
    ...makePluginFunctions([
        'キー押下中', 'キー押下', 'キー離した', 'マウスX', 'マウスY',
        'マウスボタン押下中', 'マウスボタン押下', 'マウスボタン離した', 'マウスホイール', 'キーコード'
    ], '入力', 'engine_render 入力機能'),
    ...makePluginFunctions([
        '描画クリア', '描画フラッシュ', 'テクスチャ読込', 'テクスチャ削除', 'テクスチャ幅', 'テクスチャ高さ',
        'スプライト描画', 'スプライト描画拡張', 'スプライト描画UV', 'スプライト描画フリップ',
        '矩形描画', '矩形塗潰', '円描画', '円塗潰', '直線描画', '三角形描画', '三角形塗潰',
        'フォント読込', 'フォント読込デフォルト', 'フォント削除', 'テキスト描画', 'テキスト幅', 'テキスト高さ'
    ], '描画', 'engine_render 描画機能'),
    ...makePluginFunctions([
        'カメラ位置設定', 'カメラズーム設定', 'カメラ回転設定', 'カメラリセット',
        'カメラX取得', 'カメラY取得', 'カメラズーム取得',
        '乱数', '乱数整数', 'スクリーン変換ワールド', 'ワールド変換スクリーン', 'テキスト折返し描画'
    ], 'ユーティリティ', 'engine_render 補助機能')
];

const ENGINE_2D_FUNCTIONS: PluginFuncInfo[] = [
    ...makePluginFunctions(['物理初期化', '物理終了', '物理更新'], '物理', 'engine_2d 物理ワールド機能'),
    ...makePluginFunctions([
        'ボディ作成', 'ボディ削除', 'ボディX取得', 'ボディY取得', 'ボディW取得', 'ボディH取得',
        'ボディVX取得', 'ボディVY取得', 'ボディ位置設定', 'ボディ速度設定', 'ボディ速度加算',
        'ボディ重力スケール設定', 'ボディ反発設定', 'ボディ減衰設定', 'ボディ衝突中',
        'ボディ矩形衝突', '接地判定', 'ボディインパルス', 'ボディ有効設定', 'ボディ有効取得',
        'ボディ摩擦設定', 'ボディサイズ設定'
    ], 'ボディ', 'engine_2d ボディ機能'),
    ...makePluginFunctions([
        'タイルマップ読込', 'タイルマップ削除', 'タイルマップ列数', 'タイルマップ行数',
        'タイルインデックス取得', 'タイルインデックス設定', 'タイルマップ矩形衝突',
        'タイルマップ衝突応答', 'ピクセルタイル取得', 'レイキャスト'
    ], 'タイルマップ', 'engine_2d タイルマップ機能')
];

const ENGINE_AUDIO_FUNCTIONS: PluginFuncInfo[] = [
    ...makePluginFunctions(['音声初期化', '音声終了', '主音量設定', '主音量取得'], '初期化', 'engine_audio 全体機能'),
    ...makePluginFunctions([
        '音楽読込', '音楽再生', '音楽停止', '音楽一時停止', '音楽再開', '音楽ループ設定',
        '音楽音量設定', '音楽位置設定', '音楽位置取得', '音楽再生中', '音楽削除',
        '音楽ピッチ設定', '音楽フェードイン', '音楽フェードアウト', '音楽クロスフェード',
        '音楽パン設定', '音楽長さ取得'
    ], '音楽', 'engine_audio 音楽機能'),
    ...makePluginFunctions([
        'SE読込', 'SE再生', 'SE再生音量', 'SE停止', 'SE音量設定', 'SEピッチ設定',
        'SEループ設定', 'SE再生確認', 'SE削除', 'SEパン設定', 'SE長さ取得'
    ], '効果音', 'engine_audio 効果音機能')
];

const ENGINE_RPG_FUNCTIONS: PluginFuncInfo[] = [
    ...makePluginFunctions([
        'キャラ登録', 'キャラ名取得', 'キャラHP取得', 'キャラ最大HP取得', 'キャラMP取得',
        'キャラ最大MP取得', 'キャラATK取得', 'キャラDEF取得', 'キャラSPD取得',
        'キャラLv取得', 'キャラEXP取得', 'キャラ生存確認', 'キャラHP設定', '経験値付与'
    ], 'キャラクター', 'engine_rpg キャラクター機能'),
    ...makePluginFunctions([
        'アイテム登録', 'アイテム追加', 'アイテム削除', 'アイテム所持数', 'アイテム所持確認',
        'アイテム名取得', 'アイテム購入', 'アイテム売却', 'アイテム使用'
    ], 'アイテム', 'engine_rpg アイテム機能'),
    ...makePluginFunctions([
        'バトル開始', 'バトルアクション', 'バトル状態', 'バトルメッセージ',
        'バトル次アクター', 'ダメージ計算', 'バトルターン', '最後ダメージ',
        'HP回復', 'MP回復'
    ], 'バトル', 'engine_rpg バトル機能'),
    ...makePluginFunctions([
        'メッセージ追加', 'メッセージ更新', 'メッセージ次へ', 'メッセージ空',
        'メッセージ速度設定', '現在メッセージ取得', '現在話者取得', 'メッセージ完了',
        '選択肢初期化', '選択肢追加', '選択肢選択', '選択肢アクティブ',
        '選択済', '選択肢テキスト', '選択肢数'
    ], 'ノベル', 'engine_rpg ノベル機能'),
    ...makePluginFunctions([
        'ノベル背景設定', 'ノベル背景取得', 'ノベルキャラ設定', 'ノベルキャラパス',
        'ノベルキャラ表情', 'ノベルキャラクリア', 'ノベルオート設定',
        'ノベルオート取得', 'ノベルスキップ設定', 'ノベルスキップ取得',
        'ノベルオート間隔設定', 'ノベルオート間隔取得', 'ノベルログ追加',
        'ノベルログ件数', 'ノベルログ話者', 'ノベルログテキスト'
    ], 'ノベル', 'engine_rpg ノベル表示機能'),
    ...makePluginFunctions([
        'フラグ設定', 'フラグ取得', '変数設定', '変数取得', 'セーブ', 'ロード',
        'セーブ存在確認', 'セーブ削除', 'ゴールド取得', 'ゴールド設定',
        'ゴールド加算', 'ゴールド消費'
    ], '状態管理', 'engine_rpg 状態管理機能')
];

const ENGINE_CORE_FUNCTIONS: PluginFuncInfo[] = [
    ...makePluginFunctions(['エンジン初期化', 'エンジン終了', 'エンジンバージョン'], 'エンジン', 'engine_core エンジン機能'),
    ...makePluginFunctions([
        'エンティティ作成', 'エンティティ削除', 'エンティティ生存確認', 'エンティティ数',
        'コンポーネント登録', 'コンポーネント設定', 'コンポーネント取得', 'コンポーネント有無',
        'コンポーネント削除', 'タグ追加', 'タグ削除', 'クエリ実行'
    ], 'ECS', 'engine_core ECS機能'),
    ...makePluginFunctions([
        'キー押下中', 'キー押下', 'マウス座標', '入力フレーム開始',
        'アクション押下', 'アクション押下中'
    ], '入力', 'engine_core 入力機能'),
    ...makePluginFunctions([
        'VFSマウント', 'VFS読込', 'VFS存在確認', '物理ステップ',
        '物理ボディ追加', '物理力適用', '物理同期', 'レンダーパス追加',
        'レンダーコンパイル', 'レンダー実行', 'レンダークリア',
        'ログ情報', 'ログ警告', 'ログエラー'
    ], 'システム', 'engine_core システム機能')
];

export const ENGINE_PLUGINS: PluginInfo[] = [
    {
        pluginName: 'engine_render',
        displayName: '描画',
        version: '1.0.0',
        commonAliases: ['描画', 'Render', 'render', 'レンダー'],
        description: 'Kaname向け2Dレンダリングエンジン',
        functions: ENGINE_RENDER_FUNCTIONS,
    },
    {
        pluginName: 'engine_2d',
        displayName: '物理2D',
        version: '1.0.0',
        commonAliases: ['物理2D', '物理', 'Physics2D', 'physics2d'],
        description: 'Kaname向け2D物理・タイルマップエンジン',
        functions: ENGINE_2D_FUNCTIONS,
    },
    {
        pluginName: 'engine_rpg',
        displayName: 'RPG',
        version: '1.0.0',
        commonAliases: ['RPG', 'rpg', 'ノベル', 'ゲーム'],
        description: 'Kaname向けRPG・ノベルゲーム支援エンジン',
        functions: ENGINE_RPG_FUNCTIONS,
    },
    {
        pluginName: 'engine_audio',
        displayName: '音声',
        version: '1.0.0',
        commonAliases: ['音声', 'Audio', 'audio', 'サウンド'],
        description: 'Kaname向け音声・BGM・効果音エンジン',
        functions: ENGINE_AUDIO_FUNCTIONS,
    },
    {
        pluginName: 'engine_core',
        displayName: 'エンジン',
        version: '1.0.0',
        commonAliases: ['エンジン', 'Engine', 'engine', 'コア'],
        description: 'Kaname向けゲームエンジンコア',
        functions: ENGINE_CORE_FUNCTIONS,
    },
];
