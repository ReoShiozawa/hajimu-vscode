import * as vscode from 'vscode';

/**
 * Phase 11: パフォーマンス最適化
 *
 * 機能:
 * 1. 実行時間計測
 * 2. メモリ使用量表示
 * 3. パフォーマンスプロファイリング
 * 4. 最適化提案
 */

// ==================== 実行時間計測 ====================

class PerformanceProfiler {
  /**
   * 関数の実行時間を計測するコードを挿入
   */
  static injectTimingCode(functionName: string, code: string): string {
    return `関数 ${functionName}
    開始時刻 ← 時刻()

${code
  .split('\n')
  .map((line) => '    ' + line)
  .join('\n')}

    終了時刻 ← 時刻()
    実行時間 ← 終了時刻 - 開始時刻
    表示(\"[パフォーマンス] ${functionName}: \" + 実行時間 + \"ms\")
終わり`;
  }

  /**
   * ベンチマーク実行
   */
  static generateBenchmark(functionName: string, iterations: number = 100): string {
    return `関数 benchmark_${functionName}
    表示(\"[ベンチマーク] ${functionName} (${iterations}回)\")

    合計時間 ← 0
    最小時間 ← 999999
    最大時間 ← 0

    繰り返す ${iterations}
        開始 ← 時刻()
        ${functionName}()
        終了 ← 時刻()

        経過時間 ← 終了 - 開始
        合計時間 ← 合計時間 + 経過時間

        もし 経過時間 < 最小時間
            最小時間 ← 経過時間
        終わり

        もし 経過時間 > 最大時間
            最大時間 ← 経過時間
        終わり
    終わり

    平均時間 ← 合計時間 / ${iterations}

    表示(\"\")
    表示(\"╔════════════════════════════╗\")
    表示(\"║   ベンチマーク結果          ║\")
    表示(\"╚════════════════════════════╝\")
    表示(\"関数名: ${functionName}\")
    表示(\"反復: ${iterations}\")
    表示(\"合計時間: \" + 合計時間 + \"ms\")
    表示(\"平均時間: \" + 平均時間 + \"ms\")
    表示(\"最小時間: \" + 最小時間 + \"ms\")
    表示(\"最大時間: \" + 最大時間 + \"ms\")
    表示(\"\")
終わり

benchmark_${functionName}()
`;
  }
}

// ==================== メモリ使用量 ====================

class MemoryMonitor {
  /**
   * メモリ追跡コードを生成
   */
  static generateMemoryTracking(variableName: string): string {
    return `
    「メモリ使用量を追跡: ${variableName}」
    メモリ開始 ← システム情報(\"メモリ\")

    「処理実行」
    ${variableName} ← 処理()

    メモリ終了 ← システム情報(\"メモリ\")
    メモリ増加 ← メモリ終了 - メモリ開始

    表示(\"[メモリ] 増加量: \" + メモリ増加 + \"KB\")
`;
  }

  /**
   * メモリリーク検出
   */
  static generateMemoryLeakDetection(): string {
    return `関数 check_memory_leak
    表示(\"メモリリーク検出中...\")

    ループ 5
        メモリ前 ← システム情報(\"メモリ\")

        「オブジェクト作成」
        配列 ← []
        繰り返す 1000
            配列.追加(ランダム())
        終わり

        「オブジェクト削除」
        配列 ← 空

        メモリ後 ← システム情報(\"メモリ\")
        差分 ← メモリ後 - メモリ前

        表示(\"ループ後メモリ差分: \" + 差分 + \"KB\")
    終わり

    表示(\"メモリリーク検出完了\")
終わり

check_memory_leak()
`;
  }
}

// ==================== パフォーマンスコードアクション ====================

class PerformanceActionProvider implements vscode.CodeActionProvider {
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

    // タイミング計測を追加
    const timingAction = new vscode.CodeAction(
      '実行時間計測を追加',
      vscode.CodeActionKind.Refactor
    );

    timingAction.command = {
      title: '実行時間計測を追加',
      command: 'hajimu.addTiming',
      arguments: [document, range]
    };

    actions.push(timingAction);

    // ベンチマークを生成
    const benchmarkAction = new vscode.CodeAction(
      'ベンチマークを生成',
      vscode.CodeActionKind.Refactor
    );

    benchmarkAction.command = {
      title: 'ベンチマークを生成',
      command: 'hajimu.generateBenchmark',
      arguments: [document, range]
    };

    actions.push(benchmarkAction);

    return actions;
  }
}

// ==================== 最適化提案 ====================

class OptimizationSuggestions {
  /**
   * コードを分析して最適化提案を返す
   */
  static analyzeCode(document: vscode.TextDocument): OptimizationHint[] {
    const hints: OptimizationHint[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1. ネストが深い場合の警告
      const indentMatch = line.match(/^\s*/);
      const indentLevel = (indentMatch ? indentMatch[0] : '').length / 4;
      if (indentLevel > 4) {
        hints.push({
          line: i,
          severity: 'warning',
          message: 'ネストが深すぎます（推奨: 4段階以下）',
          suggestion: 'ヘルパー関数に分割してください'
        });
      }

      // 2. ループ内での重複計算
      if (line.includes('繰り返す') && i + 1 < lines.length) {
        const loopBody = lines.slice(i + 1, i + 10).join(' ');
        if (
          loopBody.match(/配列\.長さ/) ||
          loopBody.match(/配列\[/) ||
          loopBody.match(/文字列\.長さ/)
        ) {
          hints.push({
            line: i,
            severity: 'info',
            message: 'ループ内で長さ計算が繰り返されています',
            suggestion: 'ループ外で長さを計算し、変数に保存してください'
          });
        }
      }

      // 3. 未使用の変数（宣言後スコープ外）
      const varMatch = line.match(/変数\s+(\w+)/);
      if (varMatch) {
        const varName = varMatch[1];
        if (!lines.slice(i + 1).some((l) => l.includes(varName))) {
          hints.push({
            line: i,
            severity: 'hint',
            message: `変数「${varName}」が使用されていません`,
            suggestion: 'この変数は削除できます'
          });
        }
      }

      // 4. 連続的な同じ操作
      if (i > 0) {
        const prevLine = lines[i - 1].trim();
        const currLine = line.trim();

        if (prevLine === currLine && prevLine.includes('表示')) {
          hints.push({
            line: i,
            severity: 'hint',
            message: '連続した同じ操作があります',
            suggestion: 'ループで統合できます'
          });
        }
      }
    }

    return hints;
  }

  /**
   * 最適化提案を診断として表示
   */
  static createDiagnostics(hints: OptimizationHint[]): vscode.Diagnostic[] {
    return hints.map((hint) => {
      const severity =
        hint.severity === 'error'
          ? vscode.DiagnosticSeverity.Error
          : hint.severity === 'warning'
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Hint;

      return new vscode.Diagnostic(
        new vscode.Range(hint.line, 0, hint.line, 100),
        `${hint.message} → ${hint.suggestion}`,
        severity
      );
    });
  }
}

interface OptimizationHint {
  line: number;
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  suggestion: string;
}

// ==================== コマンド登録 ====================

export function registerPerformanceTools(context: vscode.ExtensionContext) {
  // パフォーマンスコードアクション
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      'hajimu',
      new PerformanceActionProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.Refactor]
      }
    )
  );

  // 実行時間計測追加
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'hajimu.addTiming',
      async (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, document: vscode.TextDocument, range: vscode.Range) => {
        const line = document.lineAt(range.start.line);
        const funcMatch = line.text.match(/関数\s+(\w+)/);

        if (!funcMatch) {
          vscode.window.showErrorMessage('関数定義が見つかりません');
          return;
        }

        const functionName = funcMatch[1];

        // 関数本体を抽出
        let bodyStart = range.start.line + 1;
        let bodyEnd = range.start.line + 1;

        for (let i = range.start.line + 1; i < document.lineCount; i++) {
          if (document.lineAt(i).text.includes('終わり')) {
            bodyEnd = i;
            break;
          }
        }

        const bodyRange = new vscode.Range(
          bodyStart,
          0,
          bodyEnd,
          document.lineAt(bodyEnd).text.length
        );

        const bodyText = document.getText(bodyRange);

        // タイミングコードを挿入
        const timingCode = PerformanceProfiler.injectTimingCode(functionName, bodyText);

        editor.edit((editBuilder) => {
          editBuilder.replace(
            new vscode.Range(range.start.line, 0, bodyEnd, 100),
            timingCode
          );
        });

        vscode.window.showInformationMessage('実行時間計測を追加しました');
      }
    )
  );

  // ベンチマーク生成
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'hajimu.generateBenchmark',
      async (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, document: vscode.TextDocument, range: vscode.Range) => {
        const line = document.lineAt(range.start.line);
        const funcMatch = line.text.match(/関数\s+(\w+)/);

        if (!funcMatch) {
          vscode.window.showErrorMessage('関数定義が見つかりません');
          return;
        }

        const functionName = funcMatch[1];
        const iterations = await vscode.window.showInputBox({
          placeHolder: '100',
          prompt: 'ベンチマーク反復回数を入力',
          value: '100'
        });

        if (!iterations) return;

        const benchmark = PerformanceProfiler.generateBenchmark(
          functionName,
          parseInt(iterations) || 100
        );

        // ベンチマークコードを新ファイルで開く
        const uri = vscode.Uri.parse(`untitled:benchmark_${functionName}.jp`);
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor2 = await vscode.window.showTextDocument(doc);

        editor2.edit((editBuilder) => {
          editBuilder.insert(new vscode.Position(0, 0), benchmark);
        });

        vscode.window.showInformationMessage(`ベンチマークを生成しました`);
      }
    )
  );

  // 最適化提案表示
  context.subscriptions.push(
    vscode.commands.registerCommand('hajimu.showOptimizations', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'hajimu') {
        vscode.window.showWarningMessage('はじむ ファイルを開いてください');
        return;
      }

      const hints = OptimizationSuggestions.analyzeCode(editor.document);
      const diagnostics = OptimizationSuggestions.createDiagnostics(hints);

      const collection = vscode.languages.createDiagnosticCollection('hajimu-optimization');
      collection.set(editor.document.uri, diagnostics);

      vscode.window.showInformationMessage(
        `${hints.length} 個の最適化候補を検出しました`
      );
    })
  );

  // メモリリーク検出
  context.subscriptions.push(
    vscode.commands.registerCommand('hajimu.checkMemoryLeak', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'hajimu') {
        vscode.window.showWarningMessage('はじむ ファイルを開いてください');
        return;
      }

      const memoryCheck = MemoryMonitor.generateMemoryLeakDetection();

      const uri = vscode.Uri.parse('untitled:memory_check.jp');
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor2 = await vscode.window.showTextDocument(doc);

      editor2.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), memoryCheck);
      });

      vscode.window.showInformationMessage('メモリ検査コードを生成しました');
    })
  );
}
