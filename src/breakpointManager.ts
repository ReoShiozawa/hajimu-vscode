import * as vscode from 'vscode';

/**
 * ブレークポイント管理
 */

export interface Breakpoint {
    id: string;
    file: string;
    line: number;
    condition?: string;
    logMessage?: string;
    enabled: boolean;
}

class BreakpointManager {
    private breakpoints: Map<string, Breakpoint[]> = new Map();
    private breakpointId: number = 0;
    private onBreakpointChange = new vscode.EventEmitter<void>();

    public readonly onBreakpointChanged = this.onBreakpointChange.event;

    /**
     * ブレークポイントを設定
     */
    addBreakpoint(file: string, line: number, condition?: string, logMessage?: string): Breakpoint {
        if (!this.breakpoints.has(file)) {
            this.breakpoints.set(file, []);
        }

        const breakpoint: Breakpoint = {
            id: `bp_${this.breakpointId++}`,
            file,
            line,
            condition,
            logMessage,
            enabled: true
        };

        const fileBreakpoints = this.breakpoints.get(file)!;
        // 同じ行に既にブレークポイントがあれば置き換える
        const idx = fileBreakpoints.findIndex(bp => bp.line === line);
        if (idx >= 0) {
            fileBreakpoints[idx] = breakpoint;
        } else {
            fileBreakpoints.push(breakpoint);
        }

        this.onBreakpointChange.fire();
        return breakpoint;
    }

    /**
     * ブレークポイントを削除
     */
    removeBreakpoint(file: string, line: number): void {
        const fileBreakpoints = this.breakpoints.get(file);
        if (!fileBreakpoints) {
            return;
        }

        const idx = fileBreakpoints.findIndex(bp => bp.line === line);
        if (idx >= 0) {
            fileBreakpoints.splice(idx, 1);
            this.onBreakpointChange.fire();
        }
    }

    /**
     * ファイルの全ブレークポイントを取得
     */
    getBreakpoints(file: string): Breakpoint[] {
        return this.breakpoints.get(file) || [];
    }

    /**
     * 全ブレークポイントを取得
     */
    getAllBreakpoints(): Breakpoint[] {
        const all: Breakpoint[] = [];
        for (const [, bps] of this.breakpoints) {
            all.push(...bps);
        }
        return all;
    }

    /**
     * ブレークポイントを有効化・無効化
     */
    toggleBreakpoint(file: string, line: number): void {
        const fileBreakpoints = this.breakpoints.get(file);
        if (!fileBreakpoints) {
            return;
        }

        const bp = fileBreakpoints.find(b => b.line === line);
        if (bp) {
            bp.enabled = !bp.enabled;
            this.onBreakpointChange.fire();
        }
    }

    /**
     * 全ブレークポイントをクリア
     */
    clearAll(): void {
        this.breakpoints.clear();
        this.onBreakpointChange.fire();
    }
}

export const breakpointManager = new BreakpointManager();

/**
 * ブレークポイント UI デコレーション
 */
export function registerBreakpointUI(context: vscode.ExtensionContext) {
    const breakpointDecoration = vscode.window.createTextEditorDecorationType({
        gutterIconPath: new vscode.ThemeIcon('debug-breakpoint') as any,
        gutterIconSize: 'contain',
        backgroundColor: new vscode.ThemeColor('debugIcon.breakpointCurrentStackframeForeground')
    });

    const disabledBreakpointDecoration = vscode.window.createTextEditorDecorationType({
        gutterIconPath: new vscode.ThemeIcon('debug-breakpoint-disabled') as any,
        gutterIconSize: 'contain',
        opacity: '0.5'
    });

    function updateDecorations(editor: vscode.TextEditor | undefined) {
        if (!editor || editor.document.languageId !== 'hajimu') {
            return;
        }

        const file = editor.document.fileName;
        const breakpoints = breakpointManager.getBreakpoints(file);

        const enabledBps = breakpoints
            .filter(bp => bp.enabled)
            .map(bp => new vscode.Range(bp.line, 0, bp.line, 0));

        const disabledBps = breakpoints
            .filter(bp => !bp.enabled)
            .map(bp => new vscode.Range(bp.line, 0, bp.line, 0));

        editor.setDecorations(breakpointDecoration, enabledBps);
        editor.setDecorations(disabledBreakpointDecoration, disabledBps);
    }

    // エディタが変わるたびにデコレーション更新
    vscode.window.onDidChangeActiveTextEditor(editor => {
        updateDecorations(editor);
    });

    // ドキュメント保存時や編集時に更新
    vscode.workspace.onDidChangeTextDocument(event => {
        if (vscode.window.activeTextEditor?.document === event.document) {
            updateDecorations(vscode.window.activeTextEditor);
        }
    });

    // 初期化
    updateDecorations(vscode.window.activeTextEditor);

    // ブレークポイント変更時に更新
    breakpointManager.onBreakpointChanged(() => {
        updateDecorations(vscode.window.activeTextEditor);
    });

    // ガターでのクリックでブレークポイントをトグル
    const toggleBreakpointCommand = vscode.commands.registerCommand(
        'editor.debug.action.toggleBreakpoint',
        () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'hajimu') {
                return;
            }

            const file = editor.document.fileName;
            const line = editor.selection.active.line;

            const existing = breakpointManager.getBreakpoints(file).find(bp => bp.line === line);
            if (existing) {
                breakpointManager.removeBreakpoint(file, line);
            } else {
                breakpointManager.addBreakpoint(file, line);
            }
        }
    );

    context.subscriptions.push(toggleBreakpointCommand);
}
