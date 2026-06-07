import * as vscode from 'vscode';
import { BUILTIN_FUNCTIONS, getEnglishConceptTerms, KEYWORDS } from './languageData';

/**
 * Phase 12: ドキュメント生成
 *
 * 機能:
 * 1. 関数ドキュメント自動生成
 * 2. API ドキュメント生成
 * 3. 変更ログ自動作成
 * 4. README テンプレート生成
 */

// ==================== 関数ドキュメント生成 ====================

class FunctionDocGenerator {
  /**
   * 関数からドキュメント テンプレートを生成
   */
  static generateFunctionDoc(
    functionName: string,
    parameters: string[] = [],
    returnType: string = '値'
  ): string {
    const paramDocs = parameters
      .map((p) => `@param ${p}: パラメータの説明を入力してください`)
      .join('\n');

    return `/**
 * ${functionName}
 *
 * 関数の説明を入力してください
 *
 * @example
 * 使用例を入力してください
 * 結果 ← ${functionName}(${parameters.join(', ')})
 *
${paramDocs}
 * @returns ${returnType} - 戻り値の説明を入力してください
 */
関数 ${functionName}
    「実装を入力してください」
終わり
`;
  }

  /**
   * JSDoc スタイルのドキュメントをコードから抽出
   */
  static extractDocumentation(document: vscode.TextDocument): FunctionDoc[] {
    const text = document.getText();
    const lines = text.split('\n');
    const docs: FunctionDoc[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('関数')) {
        const funcMatch = line.match(/関数\s+(\w+)/);
        if (funcMatch) {
          const functionName = funcMatch[1];

          // 前行のコメント/ドキュメントを検索
          let docComment = '';
          if (i > 0 && lines[i - 1].includes('「')) {
            docComment = lines[i - 1];
          }

          // パラメータを推定
          let parameters: string[] = [];
          const nextLines = lines.slice(i + 1, i + 10).join('\n');
          const paramMatches = nextLines.match(/(\w+)\s*←/g);
          if (paramMatches) {
            parameters = paramMatches.map((p) => p.replace(/\s*←/, ''));
          }

          docs.push({
            name: functionName,
            description: docComment.replace(/「|」/g, ''),
            parameters,
            lineNumber: i,
            isDocumented: docComment.length > 0
          });
        }
      }
    }

    return docs;
  }
}

interface FunctionDoc {
  name: string;
  description: string;
  parameters: string[];
  lineNumber: number;
  isDocumented: boolean;
}

// ==================== 英語圏概念説明 ====================

interface ConceptExplanation {
  name: string;
  terms: string[];
  description: string;
  python?: string;
  javascript?: string;
}

const CONCEPT_EXAMPLES: Record<string, { python?: string; javascript?: string }> = {
  '変数': { python: 'name = value', javascript: 'let name = value;' },
  '定数': { python: 'CONSTANT = value', javascript: 'const name = value;' },
  '関数': { python: 'def add(a, b):', javascript: 'function add(a, b) {' },
  '戻す': { python: 'return value', javascript: 'return value;' },
  '返す': { python: 'return value', javascript: 'return value;' },
  'もし': { python: 'if condition:', javascript: 'if (condition) {' },
  'それ以外もし': { python: 'elif condition:', javascript: '} else if (condition) {' },
  'それ以外': { python: 'else:', javascript: '} else {' },
  '繰り返す': { python: 'for i in range(10):', javascript: 'for (let i = 0; i < 10; i++) {' },
  '条件': { python: 'while condition:', javascript: 'while (condition) {' },
  '型': { python: 'class Person:', javascript: 'class Person {' },
  '新規': { python: 'person = Person()', javascript: 'const person = new Person();' },
  '自分': { python: 'self.name', javascript: 'this.name' },
  '初期化': { python: 'def __init__(self):', javascript: 'constructor() {' },
  '取り込む': { python: 'import module', javascript: 'import module from "module";' },
  '表示': { python: 'print(value)', javascript: 'console.log(value);' },
  '長さ': { python: 'len(items)', javascript: 'items.length' },
  '追加': { python: 'items.append(value)', javascript: 'items.push(value);' },
  'JSON解析': { python: 'json.loads(text)', javascript: 'JSON.parse(text)' },
  'JSON化': { python: 'json.dumps(value)', javascript: 'JSON.stringify(value)' }
};

function generateEnglishConceptExplanation(code: string): string {
  const concepts = collectConceptExplanations(code);
  const source = code.trim() || '(選択範囲なし)';
  const lines: string[] = [
    '# はじむ構文の英語圏用語メモ',
    '',
    '## 対象コード',
    '',
    '```jp',
    source,
    '```',
    ''
  ];

  if (concepts.length === 0) {
    lines.push('この範囲から説明できる主要な構文語は見つかりませんでした。キーワードや組み込み関数を含む行を選択してください。');
    return lines.join('\n');
  }

  lines.push('## 用語対応', '');
  lines.push('| はじむ | 英語で探す時の語 | 意味 |');
  lines.push('| --- | --- | --- |');
  for (const concept of concepts) {
    lines.push(`| \`${concept.name}\` | ${concept.terms.map(term => `\`${term}\``).join(', ')} | ${concept.description} |`);
  }

  const examples = concepts.filter(concept => concept.python || concept.javascript);
  if (examples.length > 0) {
    lines.push('', '## Python / JavaScript なら', '');
    for (const concept of examples) {
      lines.push(`### ${concept.name}`);
      if (concept.python) {
        lines.push('', '```python', concept.python, '```');
      }
      if (concept.javascript) {
        lines.push('', '```javascript', concept.javascript, '```');
      }
      lines.push('');
    }
  }

  lines.push('## 検索のヒント', '');
  lines.push('英語で調べる時は、上の `function`, `return`, `class`, `if statement` のような語を組み合わせると、他言語の資料にもつながりやすくなります。');

  return lines.join('\n');
}

function collectConceptExplanations(code: string): ConceptExplanation[] {
  const descriptions = new Map<string, string>();
  for (const keyword of KEYWORDS) {
    descriptions.set(keyword.name, keyword.description);
  }
  for (const builtin of BUILTIN_FUNCTIONS) {
    descriptions.set(builtin.name, builtin.description);
  }

  const seen = new Set<string>();
  const concepts: ConceptExplanation[] = [];
  const tokens = code.match(/[\p{L}_][\p{L}\p{N}_]*/gu) || [];

  for (const token of tokens) {
    if (seen.has(token)) {
      continue;
    }

    const terms = getEnglishConceptTerms(token);
    if (terms.length === 0) {
      continue;
    }

    const example = CONCEPT_EXAMPLES[token] || {};
    concepts.push({
      name: token,
      terms,
      description: descriptions.get(token) || 'はじむの構文・組み込み機能',
      python: example.python,
      javascript: example.javascript
    });
    seen.add(token);
  }

  return concepts;
}

function generateSelectedCodeExplanation(code: string): string {
  const source = code.trim() || '(選択範囲なし)';
  const descriptions = new Map<string, { description: string; detail: string }>();

  for (const keyword of KEYWORDS) {
    descriptions.set(keyword.name, {
      description: keyword.description,
      detail: keyword.detail
    });
  }
  for (const builtin of BUILTIN_FUNCTIONS) {
    descriptions.set(builtin.name, {
      description: builtin.description,
      detail: builtin.signature
    });
  }

  const tokens = source.match(/[\p{L}_][\p{L}\p{N}_]*/gu) || [];
  const seen = new Set<string>();
  const found = tokens
    .filter(token => {
      if (seen.has(token) || !descriptions.has(token)) {
        return false;
      }
      seen.add(token);
      return true;
    })
    .map(token => ({ name: token, ...descriptions.get(token)! }));

  const lines = [
    '# はじむコード説明',
    '',
    '## 対象コード',
    '',
    '```jp',
    source,
    '```',
    ''
  ];

  if (found.length === 0) {
    lines.push('説明できる主要なキーワードや組み込み関数は見つかりませんでした。もう少し広い範囲を選択してください。');
    return lines.join('\n');
  }

  lines.push('## 読み方', '');
  lines.push('| 要素 | 意味 | 形 |');
  lines.push('| --- | --- | --- |');
  for (const item of found) {
    lines.push(`| \`${item.name}\` | ${item.description} | \`${item.detail.replace(/\n/g, ' / ')}\` |`);
  }

  lines.push('', '## ざっくり見るポイント', '');
  if (source.includes('関数')) {
    lines.push('- `関数` から `終わり` までが、名前を付けて再利用できる処理です。');
  }
  if (source.includes('もし')) {
    lines.push('- `もし ... なら` は条件が真の時だけ中の処理を実行します。');
  }
  if (source.includes('繰り返す') || source.includes('の間')) {
    lines.push('- `繰り返す` や `条件 ... の間` は、同じ処理を複数回実行する場所です。');
  }
  if (source.includes('戻す') || source.includes('返す')) {
    lines.push('- `戻す` は関数の結果を呼び出し元へ渡します。');
  }

  return lines.join('\n');
}

function generateCodeImprovementReport(code: string): string {
  const source = code.trim() || '(選択範囲なし)';
  const suggestions = collectCodeImprovementSuggestions(source);
  const lines = [
    '# はじむコード改善メモ',
    '',
    '## 対象コード',
    '',
    '```jp',
    source,
    '```',
    ''
  ];

  if (suggestions.length === 0) {
    lines.push('この範囲では、すぐ直すべき分かりやすい改善点は見つかりませんでした。');
    lines.push('');
    lines.push('次に見るなら、変数名が意図を表しているか、関数が長くなりすぎていないか、同じ処理を繰り返していないかを確認してください。');
    return lines.join('\n');
  }

  lines.push('## 改善候補', '');
  suggestions.forEach((suggestion, index) => {
    lines.push(`${index + 1}. ${suggestion}`);
  });

  lines.push('', '## 直す順番', '');
  lines.push('まず構文が壊れている箇所を直し、次に読みやすさ、最後に構造の整理を見ると迷いにくいです。');

  return lines.join('\n');
}

function collectCodeImprovementSuggestions(code: string): string[] {
  const suggestions: string[] = [];
  const lines = code.split('\n');

  if (code.includes('返す') && code.includes('戻す')) {
    suggestions.push('`返す` と `戻す` が混在しています。主表記の `戻す` に寄せると読み手が迷いにくくなります。');
  }

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    if (/^表示\s+[^(]/u.test(trimmed)) {
      suggestions.push(`${index + 1}行目: ` + '`表示 値` より `表示(値)` の形にすると、関数呼び出しとして読み取りやすくなります。');
    }
    if (/^もし\s+/.test(trimmed) && !trimmed.includes('なら')) {
      suggestions.push(`${index + 1}行目: ` + '`もし` 文には `なら` を付けます。例: `もし 条件 なら`');
    }
    if (/^条件\s+/.test(trimmed) && !trimmed.includes('の間')) {
      suggestions.push(`${index + 1}行目: ` + '`条件` で始める while 風の繰り返しには `の間` を付けます。');
    }
    if (/^(変数|定数)\s+[\p{L}_][\p{L}\p{N}_]*\s*$/u.test(trimmed)) {
      suggestions.push(`${index + 1}行目: 変数/定数宣言は初期値まで書くと安全です。例: \`${trimmed} = 無\``);
    }
    if (trimmed.length > 100) {
      suggestions.push(`${index + 1}行目: 行が長めです。条件や計算を一時変数に分けると読みやすくなります。`);
    }
  }

  const functionCount = (code.match(/(^|\n)\s*関数\s+/g) || []).length;
  const endCount = (code.match(/(^|\n)\s*終わり\s*($|\n)/g) || []).length;
  if (functionCount > endCount) {
    suggestions.push('`関数` に対する `終わり` が足りない可能性があります。ブロックの最後を確認してください。');
  }

  if (/取り込む\s*\(\s*"[^"]+"\s*\)\s*として/u.test(code)) {
    suggestions.push('`取り込む("...") として ...` は使えますが、`取り込む "..." として ...` に統一するとサンプルと揃います。');
  }

  return Array.from(new Set(suggestions));
}

function generateDiagnosticExplanation(document: vscode.TextDocument, line: number): string {
  const diagnostics = vscode.languages
    .getDiagnostics(document.uri)
    .filter(diag => diag.range.start.line <= line && diag.range.end.line >= line);
  const codeLine = document.lineAt(line).text;
  const lines = [
    '# はじむエラー説明',
    '',
    `対象: ${line + 1}行目`,
    '',
    '```jp',
    codeLine,
    '```',
    ''
  ];

  if (diagnostics.length === 0) {
    lines.push('この行には現在表示中の診断はありません。');
    return lines.join('\n');
  }

  lines.push('## 問題と直し方', '');
  for (const diagnostic of diagnostics) {
    lines.push(`### ${diagnostic.message}`);
    lines.push('');
    lines.push(explainDiagnosticMessage(diagnostic.message));
    lines.push('');
  }

  return lines.join('\n');
}

function explainDiagnosticMessage(message: string): string {
  if (message.includes('対応する「終わり」がありません')) {
    return '`関数`、`もし`、`型` などで始めたブロックが閉じられていません。処理のまとまりの最後に `終わり` を追加してください。';
  }
  if (message.includes('「なら」がありません')) {
    return '`もし 条件 なら` の形にします。`なら` は「この条件が成り立つなら中を実行する」という区切りです。';
  }
  if (message.includes('コロン「:」がありません')) {
    return '関数定義や型定義の開始行は `:` で終わります。次の行からブロック本体を書きます。';
  }
  if (message.includes('代入「=」がありません')) {
    return '変数や定数を作る時は初期値が必要です。まだ値が決まっていない時は `= 無` を置くと意図が明確です。';
  }
  if (message.includes('未定義の可能性があります')) {
    return 'この名前は、現在のファイル内で定義・取り込みされていない可能性があります。候補が出ている場合は、綴りや import を確認してください。';
  }
  if (message.includes('import候補:')) {
    return 'プラグインのエイリアスを使っていますが、ファイル先頭で `取り込む` されていないようです。Quick Fix で import を追加できます。';
  }
  if (message.includes('閉じ括弧')) {
    return '開いた括弧に対応する閉じ括弧が足りません。行末や式の終わりに `)` または `]` を追加してください。';
  }
  if (message.includes('「返す」は「戻す」の別名')) {
    return '`返す` も意味は通りますが、補完やサンプルの主表記は `戻す` です。同じファイルでは表記を揃えると読みやすくなります。';
  }
  return '問題パネルの文言を読み、Quick Fix が出ている場合は候補を確認してください。';
}

// ==================== API ドキュメント生成 ====================

class APIDocumentationGenerator {
  /**
   * プロジェクト全体の API ドキュメントを生成
   */
  static async generateAPIDoc(
    workspaceFolder: vscode.WorkspaceFolder
  ): Promise<string> {
    const files = await vscode.workspace.findFiles(
      new vscode.RelativePattern(workspaceFolder, '**/*.jp'),
      '**/node_modules/**'
    );

    const apiDocs: string[] = [
      '# はじむ API ドキュメント\n',
      `生成日時: ${new Date().toLocaleString('ja-JP')}\n`,
      '## モジュール一覧\n'
    ];

    for (const file of files) {
      const doc = await vscode.workspace.openTextDocument(file);
      const functions = FunctionDocGenerator.extractDocumentation(doc);

      if (functions.length > 0) {
        apiDocs.push(`\n### ${file.fsPath.split('/').pop()}\n`);

        for (const func of functions) {
          apiDocs.push(`\n#### \`${func.name}\`\n`);
          apiDocs.push(`${func.description || '(説明なし)'}\n`);

          if (func.parameters.length > 0) {
            apiDocs.push(`**パラメータ:**\n`);
            func.parameters.forEach((p) => {
              apiDocs.push(`- \`${p}\`\n`);
            });
          }
        }
      }
    }

    return apiDocs.join('');
  }
}

// ==================== 変更ログ生成 ====================

class ChangelogGenerator {
  /**
   * コミットメッセージから変更ログを生成
   */
  static generateChangelog(version: string, changes: string[]): string {
    const date = new Date().toISOString().split('T')[0];

    return `# 変更ログ

## [${version}] - ${date}

### 追加
${changes
  .filter((c) => c.includes('追加') || c.includes('新'))
  .map((c) => `- ${c}`)
  .join('\n')}

### 変更
${changes
  .filter((c) => c.includes('更新') || c.includes('変更'))
  .map((c) => `- ${c}`)
  .join('\n')}

### 修正
${changes
  .filter((c) => c.includes('修正') || c.includes('バグ'))
  .map((c) => `- ${c}`)
  .join('\n')}

### 削除
${changes
  .filter((c) => c.includes('削除') || c.includes('廃止'))
  .map((c) => `- ${c}`)
  .join('\n')}
`;
  }
}

// ==================== README テンプレート ====================

class ReadmeGenerator {
  /**
   * プロジェクト用の README を生成
   */
  static generateReadme(
    projectName: string,
    description: string,
    mainFunctions: string[]
  ): string {
    return `# ${projectName}

${description}

## 機能

${mainFunctions.map((f) => `- \`${f}()\` - 説明を入力してください`).join('\n')}

## インストール

\`\`\`bash
git clone https://github.com/yourusername/${projectName}
cd ${projectName}
\`\`\`

## 使用方法

### 基本的な使い方

\`\`\`jp
${mainFunctions[0]}()
\`\`\`

### 詳細な例

\`\`\`jp
「プログラムの例」
結果 ← ${mainFunctions[0]}()
表示(結果)
\`\`\`

## API ドキュメント

詳細は [API.md](./API.md) を参照してください。

## テスト

\`\`\`bash
nihongo test_${projectName}.jp
\`\`\`

## ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) を参照してください。

## 貢献

プルリクエストを歓迎します！

## 作成者

あなたのお名前

## サポート

問題が発生した場合は、Issues セクションで報告してください。
`;
  }

  /**
   * CONTRIBUTING.md を生成
   */
  static generateContributing(): string {
    return `# 貢献ガイド

このプロジェクトへの貢献をありがとうございます！

## 始める前に

1. プロジェクトをフォークしてください
2. 機能ブランチを作成してください: \`git checkout -b feature/NewFeature\`
3. コミットしてください: \`git commit -m 'Add NewFeature'\`
4. ブランチにプッシュしてください: \`git push origin feature/NewFeature\`
5. プルリクエストを開いてください

## コーディングスタイル

- インデントは 4 スペース
- コメントは日本語で記述
- 関数には JSDoc スタイルのドキュメントを付与
- テストカバレッジ最小 80%

## テスト

すべての新機能には必ずテストを追加してください：

\`\`\`bash
nihongo test_your_feature.jp
\`\`\`

## コミットメッセージ

以下のフォーマットを使用してください：

\`\`\`
[種類] 説明

- 詳細1
- 詳細2
\`\`\`

種類:
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: フォーマット
- refactor: リファクタリング
- test: テスト追加

## ライセンス

貢献することで、あなたの作品は MIT ライセンスの下でライセンスされることに同意します。
`;
  }
}

// ==================== ドキュメント コードアクション ====================

class DocumentationActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    const line = document.lineAt(range.start.line);
    const isFunctionLine = line.text.includes('関数');

    if (!isFunctionLine) return actions;

    // ドキュメント追加アクション
    const docAction = new vscode.CodeAction(
      'ドキュメントを追加',
      vscode.CodeActionKind.Refactor
    );

    docAction.command = {
      title: 'ドキュメントを追加',
      command: 'hajimu.addDocumentation',
      arguments: [document, range]
    };

    actions.push(docAction);

    return actions;
  }
}

// ==================== コマンド登録 ====================

export function registerDocumentationTools(context: vscode.ExtensionContext) {
  // ドキュメント コードアクション
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      'hajimu',
      new DocumentationActionProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.Refactor]
      }
    )
  );

  // ドキュメント追加コマンド
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'hajimu.addDocumentation',
      async (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, document: vscode.TextDocument, range: vscode.Range) => {
        const line = document.lineAt(range.start.line);
        const funcMatch = line.text.match(/関数\s+(\w+)/);

        if (!funcMatch) {
          vscode.window.showErrorMessage('関数定義が見つかりません');
          return;
        }

        const functionName = funcMatch[1];
        const doc = FunctionDocGenerator.generateFunctionDoc(functionName);

        editor.edit((editBuilder) => {
          editBuilder.insert(new vscode.Position(range.start.line, 0), doc + '\n');
        });

        vscode.window.showInformationMessage('ドキュメントテンプレートを追加しました');
      }
    )
  );

  // API ドキュメント生成
  context.subscriptions.push(
    vscode.commands.registerCommand('hajimu.generateAPI', async () => {
      const folder = vscode.workspace.workspaceFolders?.[0];
      if (!folder) {
        vscode.window.showErrorMessage('ワークスペースを開いてください');
        return;
      }

      const apiDoc = await APIDocumentationGenerator.generateAPIDoc(folder);

      const uri = vscode.Uri.parse('untitled:API.md');
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc);

      editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), apiDoc);
      });

      vscode.window.showInformationMessage('API ドキュメントを生成しました');
    })
  );

  // 選択範囲を英語圏の用語で説明
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('hajimu.explainEnglishConcepts', async (editor: vscode.TextEditor) => {
      if (editor.document.languageId !== 'hajimu') {
        vscode.window.showWarningMessage('はじむ ファイルを開いてください');
        return;
      }

      const selection = editor.selection;
      const code = selection.isEmpty
        ? editor.document.lineAt(selection.active.line).text
        : editor.document.getText(selection);
      const explanation = generateEnglishConceptExplanation(code);

      const uri = vscode.Uri.parse('untitled:はじむ英語用語メモ.md');
      const doc = await vscode.workspace.openTextDocument(uri);
      const outputEditor = await vscode.window.showTextDocument(doc, { preview: false });

      await outputEditor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), explanation);
      });
    })
  );

  // 選択範囲を日本語で説明
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('hajimu.explainSelectedCode', async (editor: vscode.TextEditor) => {
      if (editor.document.languageId !== 'hajimu') {
        vscode.window.showWarningMessage('はじむ ファイルを開いてください');
        return;
      }

      const selection = editor.selection;
      const code = selection.isEmpty
        ? editor.document.lineAt(selection.active.line).text
        : editor.document.getText(selection);
      const explanation = generateSelectedCodeExplanation(code);

      const uri = vscode.Uri.parse('untitled:はじむコード説明.md');
      const doc = await vscode.workspace.openTextDocument(uri);
      const outputEditor = await vscode.window.showTextDocument(doc, { preview: false });

      await outputEditor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), explanation);
      });
    })
  );

  // 選択範囲の改善提案
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('hajimu.improveSelectedCode', async (editor: vscode.TextEditor) => {
      if (editor.document.languageId !== 'hajimu') {
        vscode.window.showWarningMessage('はじむ ファイルを開いてください');
        return;
      }

      const selection = editor.selection;
      const code = selection.isEmpty
        ? editor.document.getText()
        : editor.document.getText(selection);
      const report = generateCodeImprovementReport(code);

      const uri = vscode.Uri.parse('untitled:はじむコード改善メモ.md');
      const doc = await vscode.workspace.openTextDocument(uri);
      const outputEditor = await vscode.window.showTextDocument(doc, { preview: false });

      await outputEditor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), report);
      });
    })
  );

  // カーソル行のエラー説明
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('hajimu.explainDiagnosticsAtCursor', async (editor: vscode.TextEditor) => {
      if (editor.document.languageId !== 'hajimu') {
        vscode.window.showWarningMessage('はじむ ファイルを開いてください');
        return;
      }

      const explanation = generateDiagnosticExplanation(editor.document, editor.selection.active.line);
      const uri = vscode.Uri.parse('untitled:はじむエラー説明.md');
      const doc = await vscode.workspace.openTextDocument(uri);
      const outputEditor = await vscode.window.showTextDocument(doc, { preview: false });

      await outputEditor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), explanation);
      });
    })
  );

  // 変更ログ生成
  context.subscriptions.push(
    vscode.commands.registerCommand('hajimu.generateChangelog', async () => {
      const version = await vscode.window.showInputBox({
        placeHolder: '2.1.0',
        prompt: 'バージョン番号を入力'
      });

      if (!version) return;

      const changesInput = await vscode.window.showInputBox({
        placeHolder: '変更内容をカンマ区切りで入力',
        prompt: '追加: 新機能, 修正: バグ対応, ...'
      });

      if (!changesInput) return;

      const changes = changesInput.split(',').map((c) => c.trim());
      const changelog = ChangelogGenerator.generateChangelog(version, changes);

      const uri = vscode.Uri.parse('untitled:CHANGELOG.md');
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc);

      editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), changelog);
      });

      vscode.window.showInformationMessage('変更ログを生成しました');
    })
  );

  // README 生成
  context.subscriptions.push(
    vscode.commands.registerCommand('hajimu.generateReadme', async () => {
      const projectName = await vscode.window.showInputBox({
        placeHolder: 'MyProject',
        prompt: 'プロジェクト名を入力'
      });

      if (!projectName) return;

      const description = await vscode.window.showInputBox({
        placeHolder: 'プロジェクトの説明',
        prompt: '短い説明を入力'
      });

      if (!description) return;

      const folder = vscode.workspace.workspaceFolders?.[0];
      let mainFunctions: string[] = [];

      if (folder) {
        const files = await vscode.workspace.findFiles(
          new vscode.RelativePattern(folder, '**/*.jp'),
          '**/node_modules/**'
        );

        if (files.length > 0) {
          const doc = await vscode.workspace.openTextDocument(files[0]);
          const functions = FunctionDocGenerator.extractDocumentation(doc);
          mainFunctions = functions.slice(0, 3).map((f) => f.name);
        }
      }

      if (mainFunctions.length === 0) {
        mainFunctions = ['main', 'process', 'execute'];
      }

      const readme = ReadmeGenerator.generateReadme(projectName, description, mainFunctions);

      const uri = vscode.Uri.parse('untitled:README.md');
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc);

      editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), readme);
      });

      vscode.window.showInformationMessage('README を生成しました');
    })
  );

  // CONTRIBUTING.md 生成
  context.subscriptions.push(
    vscode.commands.registerCommand('hajimu.generateContributing', async () => {
      const contributing = ReadmeGenerator.generateContributing();

      const uri = vscode.Uri.parse('untitled:CONTRIBUTING.md');
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc);

      editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), contributing);
      });

      vscode.window.showInformationMessage('CONTRIBUTING.md を生成しました');
    })
  );

  // ドキュメント確認
  context.subscriptions.push(
    vscode.commands.registerCommand('hajimu.checkDocumentation', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'hajimu') {
        vscode.window.showWarningMessage('はじむ ファイルを開いてください');
        return;
      }

      const functions = FunctionDocGenerator.extractDocumentation(editor.document);
      const undocumented = functions.filter((f) => !f.isDocumented);

      if (undocumented.length === 0) {
        vscode.window.showInformationMessage('すべての関数がドキュメントされています');
        return;
      }

      const message = `${undocumented.length} 個の関数がドキュメントされていません:\n${undocumented
        .map((f) => `  - ${f.name}`)
        .join('\n')}`;

      vscode.window.showWarningMessage(message);

      // 診断を設定
      const diagnostics: vscode.Diagnostic[] = undocumented.map((func) => {
        return new vscode.Diagnostic(
          new vscode.Range(func.lineNumber, 0, func.lineNumber, 100),
          `関数「${func.name}」がドキュメントされていません`,
          vscode.DiagnosticSeverity.Warning
        );
      });

      const collection = vscode.languages.createDiagnosticCollection('hajimu-docs');
      collection.set(editor.document.uri, diagnostics);
    })
  );
}
