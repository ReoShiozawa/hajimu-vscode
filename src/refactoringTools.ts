import * as vscode from 'vscode';

/**
 * Phase 9: リファクタリングツール
 *
 * 機能:
 * 1. 変数名一括変更 (Rename Symbol)
 * 2. 関数抽出 (Extract Function)
 * 3. ブロック抽出 (Extract Block)
 * 4. 不要なコード削除 (Remove Dead Code)
 */

// ==================== 変数名一括変更 ====================

class RenameProvider implements vscode.RenameProvider {
  /**
   * 変数・関数の一括変更を提供
   */
  async provideRenameEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    newName: string,
    token: vscode.CancellationToken
  ): Promise<vscode.WorkspaceEdit | null> {
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) return null;

    const oldName = document.getText(wordRange);

    // スコープ内のすべての参照を検索
    const edit = new vscode.WorkspaceEdit();
    const text = document.getText();
    const lines = text.split('\n');

    // シンプルな正規表現マッチング（単語境界）
    const regex = new RegExp(`\\b${oldName}\\b`, 'g');

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      let match;
      while ((match = regex.exec(line)) !== null) {
        const range = new vscode.Range(
          lineIdx,
          match.index,
          lineIdx,
          match.index + oldName.length
        );
        edit.replace(document.uri, range, newName);
      }
    }

    return edit;
  }

  /**
   * 変数名の変更が可能かチェック
   */
  prepareRename(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Range> {
    const wordRange = document.getWordRangeAtPosition(position);
    return wordRange || null;
  }
}

// ==================== 関数抽出 ====================

class ExtractFunctionProvider implements vscode.CodeActionProvider {
  /**
   * 選択範囲から関数を抽出
   */
  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    // 選択範囲がある場合のみ
    if (range.isEmpty) return actions;

    const selectedText = document.getText(range);

    // 空行・コメントのみはスキップ
    if (!selectedText.trim() || selectedText.trim().startsWith('//')) {
      return actions;
    }

    // 関数抽出アクション
    const extractAction = new vscode.CodeAction(
      '関数に抽出',
      vscode.CodeActionKind.RefactorExtract
    );

    extractAction.command = {
      title: '関数に抽出',
      command: 'hajimu.extractFunction',
      arguments: [document, range]
    };

    actions.push(extractAction);
    return actions;
  }
}

// ==================== ブロック抽出 ====================

class ExtractBlockProvider {
  /**
   * if/for/while ブロックを独立した部分関数に抽出
   */
  static extractBlock(
    document: vscode.TextDocument,
    range: vscode.Range,
    functionName: string
  ): vscode.WorkspaceEdit | null {
    const selectedText = document.getText(range);

    // 関数テンプレートを生成
    const extractedCode = `関数 ${functionName}\n${selectedText}\n終わり\n\n`;

    const edit = new vscode.WorkspaceEdit();

    // 1. 抽出された関数を document の最後に追加
    const lastLine = document.lineCount - 1;
    const lastChar = document.lineAt(lastLine).text.length;
    const insertPos = new vscode.Position(lastLine, lastChar);
    edit.insert(document.uri, insertPos, '\n' + extractedCode);

    // 2. 選択範囲を関数呼び出しに置換
    edit.replace(
      document.uri,
      range,
      `${functionName}()`
    );

    return edit;
  }

}

// ==================== 不要なコード削除 ====================

class DeadCodeAnalyzer {
  /**
   * 使用されていない変数・関数を検出
   */
  static findDeadCode(document: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    // 定義された変数・関数を追跡
    const definitions = new Map<string, number>(); // name -> lineNumber
    const usages = new Set<string>();

    // 1パス目: 定義を検出
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];

      // 変数定義: `変数 名前 ← 値`
      const varMatch = line.match(/^\s*変数\s+(\w+)\s*←/);
      if (varMatch) {
        const name = varMatch[1];
        definitions.set(name, lineIdx);
      }

      // 関数定義: `関数 名前`
      const funcMatch = line.match(/^\s*関数\s+(\w+)/);
      if (funcMatch) {
        const name = funcMatch[1];
        definitions.set(name, lineIdx);
      }
    }

    // 2パス目: 使用を検出
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      for (const [name] of definitions) {
        if (!line.includes(name)) continue;
        // 定義行は除外
        if (lineIdx !== definitions.get(name)) {
          usages.add(name);
        }
      }
    }

    // 3パス目: 未使用を診断
    for (const [name, lineIdx] of definitions) {
      if (!usages.has(name)) {
        const line = document.lineAt(lineIdx);
        const range = new vscode.Range(
          lineIdx,
          line.text.indexOf(name),
          lineIdx,
          line.text.indexOf(name) + name.length
        );

        diagnostics.push(
          new vscode.Diagnostic(
            range,
            `「${name}」は定義されているが使用されていません`,
            vscode.DiagnosticSeverity.Hint
          )
        );
      }
    }

    return diagnostics;
  }

  /**
   * 不要なコード削除のコードアクション
   */
  static createRemoveAction(
    document: vscode.TextDocument,
    name: string,
    lineIdx: number
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      `「${name}」を削除`,
      vscode.CodeActionKind.QuickFix
    );

    const edit = new vscode.WorkspaceEdit();
    const range = document.lineAt(lineIdx).range;
    edit.delete(document.uri, range);

    action.edit = edit;
    return action;
  }
}

// ==================== リファクタリング実行コマンド ====================

export function registerRefactoringTools(context: vscode.ExtensionContext) {
  // 変数・関数名の一括変更
  context.subscriptions.push(
    vscode.languages.registerRenameProvider('hajimu', new RenameProvider())
  );

  // 関数抽出アクション
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      'hajimu',
      new ExtractFunctionProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.RefactorExtract]
      }
    )
  );

  // 関数抽出コマンド実行
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'hajimu.extractFunction',
      async (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, document: vscode.TextDocument, range: vscode.Range) => {
        const name = await vscode.window.showInputBox({
          placeHolder: 'new関数名を入力',
          prompt: '抽出した関数の名前を入力してください'
        });

        if (!name) return;

        const selectedText = document.getText(range);
        const indentMatch = document.lineAt(range.start.line).text.match(/^(\s*)/);
        const baseIndent = indentMatch ? indentMatch[1] : '';

        const functionCode = `関数 ${name}\n${baseIndent}    ${selectedText.trim()}\n${baseIndent}終わり\n`;

        // 選択範囲を関数呼び出しに置換
        editor.edit(editBuilder => {
          editBuilder.replace(range, `${name}()`);
        });

        // 関数定義を最後に追加
        const lastLine = document.lineAt(document.lineCount - 1);
        const insertPos = new vscode.Position(
          lastLine.lineNumber,
          lastLine.text.length
        );

        editor.edit(editBuilder => {
          editBuilder.insert(insertPos, '\n\n' + functionCode);
        });

        vscode.window.showInformationMessage(`関数「${name}」を抽出しました`);
      }
    )
  );

  // ブロック抽出コマンド
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'hajimu.extractBlock',
      async (editor: vscode.TextEditor) => {
        const document = editor.document;
        const selection = editor.selection;

        if (selection.isEmpty) {
          vscode.window.showWarningMessage('ブロックを選択してください');
          return;
        }

        const name = await vscode.window.showInputBox({
          placeHolder: '抽出関数の名前を入力',
          prompt: 'ブロック用の関数名'
        });

        if (!name) return;

        const wsEdit = ExtractBlockProvider.extractBlock(document, selection, name);
        if (wsEdit) {
          await vscode.workspace.applyEdit(wsEdit);
          vscode.window.showInformationMessage(`ブロックを関数「${name}」に抽出しました`);
        }
      }
    )
  );

  // 不要なコード検出
  const deadCodeDiagnostics = vscode.languages.createDiagnosticCollection('hajimu-dead-code');

  vscode.workspace.onDidChangeTextDocument(
    (event: vscode.TextDocumentChangeEvent) => {
      if (event.document.languageId !== 'hajimu') return;

      const diagnostics = DeadCodeAnalyzer.findDeadCode(event.document);
      deadCodeDiagnostics.set(event.document.uri, diagnostics);
    },
    null,
    context.subscriptions
  );

  // 既存エディタに対して初期診断
  if (vscode.window.activeTextEditor) {
    const doc = vscode.window.activeTextEditor.document;
    if (doc.languageId === 'hajimu') {
      const diagnostics = DeadCodeAnalyzer.findDeadCode(doc);
      deadCodeDiagnostics.set(doc.uri, diagnostics);
    }
  }

  context.subscriptions.push(deadCodeDiagnostics);
}
