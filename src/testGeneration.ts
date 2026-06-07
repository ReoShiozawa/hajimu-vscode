import * as vscode from 'vscode';

/**
 * Phase 10: テスト生成・検証
 *
 * 機能:
 * 1. ユニットテストテンプレート自動生成
 * 2. テスト実行・検証
 * 3. テストカバレッジ表示
 * 4. アサーション追加支援
 */

// ==================== テストテンプレート生成 ====================

class TestGeneratorProvider implements vscode.CodeActionProvider {
  /**
   * 関数からテストケースを自動生成
   */
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

    // テスト生成アクション
    const testAction = new vscode.CodeAction(
      'テストを生成',
      vscode.CodeActionKind.RefactorExtract
    );

    testAction.command = {
      title: 'テストを生成',
      command: 'hajimu.generateTest',
      arguments: [document, range]
    };

    actions.push(testAction);
    return actions;
  }
}

// ==================== テストテンプレート ====================

class TestTemplate {
  /**
   * 関数情報からテストテンプレートを生成
   */
  static generateTestTemplate(
    functionName: string,
    parameters: string[] = []
  ): string {
    const testName = `test_${functionName}`;

    const template = `関数 ${testName}
    「${functionName} のテスト」
    表示("テスト: ${functionName}")

    「テストケース 1: 基本動作」
    結果 ← ${functionName}(${parameters.map((p) => `1`).join(', ')})
    確認(結果 != 空, \"戻り値が存在すること\")

    「テストケース 2: エッジケース」
    結果2 ← ${functionName}(${parameters.map((p) => `0`).join(', ')})
    確認(結果2 != 空, \"ゼロ入力でも処理されること\")

    「テストケース 3: 無効入力」
    試行
        結果3 ← ${functionName}(${parameters.map((p) => `-1`).join(', ')})
    例外
        表示(\"例外をキャッチしました\")
    終わり

    表示(\"すべてのテストが完了しました\")
終わり
`;
    return template;
  }

  /**
   * 基本的なテストスイートテンプレート
   */
  static generateTestSuite(filename: string, functionNames: string[]): string {
    const tests = functionNames
      .map((name) => `  test_${name}()`)
      .join('\n');

    return `「${filename} のテストスイート」

関数 run_all_tests
    表示(\"═══════════════════════════\")
    表示(\"   はじむ テストスイート実行\")
    表示(\"═══════════════════════════\")

${tests}

    表示(\"═══════════════════════════\")
    表示(\"   テストスイート完了！\")
    表示(\"═══════════════════════════\")
終わり

run_all_tests()
`;
  }
}

// ==================== アサーション支援 ====================

class AssertionProvider {
  /**
   * よく使うアサーション関数を定義
   */
  static getAssertionLibrary(): string {
    return `「はじむ テストアサーション ライブラリ」

関数 確認(条件, メッセージ)
    もし 条件 ← 真
        表示(\"✓ \" + メッセージ)
    そうでなければ
        表示(\"✗ FAIL: \" + メッセージ)
        例外(\"アサーション失敗: \" + メッセージ)
    終わり
終わり

関数 確認等しい(実際, 期待値, メッセージ)
    もし 実際 = 期待値
        表示(\"✓ \" + メッセージ)
    そうでなければ
        表示(\"✗ FAIL: \" + メッセージ)
        表示(\"  期待値: \" + 期待値)
        表示(\"  実際値: \" + 実際)
        例外(\"アサーション失敗\")
    終わり
終わり

関数 確認空でない(値, メッセージ)
    もし 値 != 空
        表示(\"✓ \" + メッセージ)
    そうでなければ
        表示(\"✗ FAIL: \" + メッセージ)
        例外(\"値が空です\")
    終わり
終わり

関数 確認例外発生(関数, メッセージ)
    試行
        関数()
        表示(\"✗ FAIL: \" + メッセージ)
        例外(\"例外が発生しませんでした\")
    例外
        表示(\"✓ \" + メッセージ + \" (例外発生)\")
    終わり
終わり
`;
  }
}

// ==================== テスト実行・検証 ====================

class TestRunner {
  /**
   * テストファイルを実行
   */
  static async runTests(
    testFilePath: string,
    interpreter: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');

      const process = spawn(interpreter, [testFilePath]);
      let output = '';
      let errorOutput = '';

      process.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });

      process.stderr?.on('data', (data: Buffer) => {
        errorOutput += data.toString();
      });

      process.on('close', (code: number) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`テスト失敗 (終了コード: ${code})\n${errorOutput}`));
        }
      });

      process.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  /**
   * テスト結果をパース
   */
  static parseTestResults(output: string): TestResult {
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;
    const results: string[] = [];

    for (const line of lines) {
      if (line.includes('✓')) {
        passed++;
        results.push('✓ ' + line.replace(/✓/, '').trim());
      } else if (line.includes('✗') || line.includes('FAIL')) {
        failed++;
        results.push('✗ ' + line.replace(/✗|FAIL/, '').trim());
      }
    }

    return { passed, failed, results };
  }
}

interface TestResult {
  passed: number;
  failed: number;
  results: string[];
}

// ==================== テストカバレッジ ====================

class CoverageAnalyzer {
  /**
   * 関数のテストカバレッジを計算
   */
  static analyzeCoverage(document: vscode.TextDocument): CoverageReport {
    const text = document.getText();
    const lines = text.split('\n');

    // すべての関数を抽出
    const functions: string[] = [];
    const testedFunctions: Set<string> = new Set();

    for (const line of lines) {
      const funcMatch = line.match(/^\s*関数\s+(\w+)/);
      if (funcMatch) {
        functions.push(funcMatch[1]);
      }

      // テスト関数を検出
      if (line.includes('test_')) {
        const testMatch = line.match(/test_(\w+)/);
        if (testMatch) {
          testedFunctions.add(testMatch[1]);
        }
      }
    }

    const coverage = functions.length > 0 ? (testedFunctions.size / functions.length) * 100 : 0;

    return {
      totalFunctions: functions.length,
      testedFunctions: testedFunctions.size,
      coverage: Math.round(coverage),
      uncoveredFunctions: functions.filter((f) => !testedFunctions.has(f))
    };
  }

  /**
   * カバレッジレポートを生成
   */
  static generateCoverageReport(report: CoverageReport): string {
    return `
╔════════════════════════════════════════╗
║     テストカバレッジ レポート          ║
╚════════════════════════════════════════╝

テスト対象関数: ${report.testedFunctions} / ${report.totalFunctions}
カバレッジ: ${report.coverage}%

${report.coverage >= 80 ? '✅ 良好なカバレッジです' : '⚠️  カバレッジ改善が必要です'}

未テスト関数:
${report.uncoveredFunctions.map((f) => `  - ${f}`).join('\n')}
`;
  }
}

interface CoverageReport {
  totalFunctions: number;
  testedFunctions: number;
  coverage: number;
  uncoveredFunctions: string[];
}

// ==================== 診断・エラーレポート ====================

class TestDiagnostics {
  static collection: vscode.DiagnosticCollection;

  /**
   * テスト失敗を診断として表示
   */
  static reportTestFailure(
    document: vscode.TextDocument,
    testName: string,
    error: string,
    lineNumber: number
  ) {
    const range = new vscode.Range(lineNumber, 0, lineNumber, 100);

    const diagnostic = new vscode.Diagnostic(
      range,
      `テスト失敗: ${testName}\n${error}`,
      vscode.DiagnosticSeverity.Error
    );

    this.collection.set(document.uri, [diagnostic]);
  }

  /**
   * テスト成功を解除
   */
  static clearTestFailures(document: vscode.TextDocument) {
    this.collection.delete(document.uri);
  }
}

// ==================== コマンド登録 ====================

export function registerTestGeneration(context: vscode.ExtensionContext) {
  // テスト生成アクション
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      'hajimu',
      new TestGeneratorProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.RefactorExtract]
      }
    )
  );

  // テスト生成コマンド
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'hajimu.generateTest',
      async (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, document: vscode.TextDocument, range: vscode.Range) => {
        const line = document.lineAt(range.start.line);
        const funcMatch = line.text.match(/関数\s+(\w+)/);

        if (!funcMatch) {
          vscode.window.showErrorMessage('関数定義が見つかりません');
          return;
        }

        const functionName = funcMatch[1];
        const testTemplate = TestTemplate.generateTestTemplate(functionName);

        // テストファイルを作成
        const uri = vscode.Uri.parse(
          `untitled:${functionName}_test.jp`
        );

        const doc = await vscode.workspace.openTextDocument(uri);
        const editor2 = await vscode.window.showTextDocument(doc);

        editor2.edit((editBuilder) => {
          editBuilder.insert(new vscode.Position(0, 0), testTemplate);
        });

        vscode.window.showInformationMessage(`テスト「${functionName}_test」を生成しました`);
      }
    )
  );

  // アサーション ライブラリ挿入
  context.subscriptions.push(
    vscode.commands.registerCommand('hajimu.insertAssertions', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'hajimu') {
        vscode.window.showWarningMessage('はじむ ファイルを開いてください');
        return;
      }

      const assertionLib = AssertionProvider.getAssertionLibrary();
      editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), assertionLib + '\n\n');
      });

      vscode.window.showInformationMessage('アサーション ライブラリを挿入しました');
    })
  );

  // テスト実行コマンド
  context.subscriptions.push(
    vscode.commands.registerCommand('hajimu.runTests', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'hajimu') {
        vscode.window.showWarningMessage('テストファイルを開いてください');
        return;
      }

      const document = editor.document;
      const outputChannel = vscode.window.createOutputChannel('はじむ テスト');
      outputChannel.show();

      outputChannel.appendLine('テスト実行中...\n');

      try {
        // テスト実行（nihongo インタープリタ必要）
        const nihongoPath = 'nihongo'; // パスは設定から取得
        const testResult = await TestRunner.runTests(document.fileName, nihongoPath);

        const parsed = TestRunner.parseTestResults(testResult);

        outputChannel.appendLine(`✓ テスト完了`);
        outputChannel.appendLine(`成功: ${parsed.passed}, 失敗: ${parsed.failed}\n`);

        parsed.results.forEach((r) => outputChannel.appendLine(r));

        // 診断を設定
        TestDiagnostics.collection = vscode.languages.createDiagnosticCollection('hajimu-tests');
        if (parsed.failed > 0) {
          TestDiagnostics.collection.set(document.uri, [
            new vscode.Diagnostic(
              new vscode.Range(0, 0, 0, 1),
              `${parsed.failed} 個のテストが失敗しました`,
              vscode.DiagnosticSeverity.Error
            )
          ]);
        } else {
          TestDiagnostics.collection.clear();
        }
      } catch (err) {
        outputChannel.appendLine(`✗ テスト実行エラー: ${err}`);
        vscode.window.showErrorMessage(`テスト実行失敗: ${err}`);
      }
    })
  );

  // テストカバレッジ表示
  context.subscriptions.push(
    vscode.commands.registerCommand('hajimu.showCoverage', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'hajimu') {
        vscode.window.showWarningMessage('はじむ ファイルを開いてください');
        return;
      }

      const report = CoverageAnalyzer.analyzeCoverage(editor.document);

      const panel = vscode.window.createWebviewPanel(
        'testCoverage',
        'テストカバレッジ',
        vscode.ViewColumn.Beside,
        {}
      );

      panel.webview.html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
    h1 { color: #4ec9b0; }
    .stat { margin: 10px 0; }
    .covered { color: #6a9955; }
    .uncovered { color: #d16969; }
    .percentage { font-size: 2em; font-weight: bold; }
  </style>
</head>
<body>
  <h1>テストカバレッジ レポート</h1>
  <div class="stat">
    <div>テスト対象関数: <span class="covered">${report.testedFunctions}</span> / ${report.totalFunctions}</div>
    <div>カバレッジ: <span class="percentage">${report.coverage}%</span></div>
  </div>
  <h2>未テスト関数</h2>
  <ul>
    ${report.uncoveredFunctions.map((f) => `<li class="uncovered">${f}</li>`).join('')}
  </ul>
</body>
</html>
      `;
    })
  );
}
