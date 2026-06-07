import * as vscode from 'vscode';

export interface RomajiExpansionConfig {
    enabled: boolean;
    autoExpandOnSpace: boolean;
    includeEnglishAliases: boolean;
}

export interface HajimuDiagnosticsConfig {
    undefinedIdentifiers: boolean;
}

export function getRomajiExpansionConfig(scope?: vscode.Uri): RomajiExpansionConfig {
    const config = vscode.workspace.getConfiguration('hajimu', scope);
    return {
        enabled: config.get('romajiExpansion.enabled', true),
        autoExpandOnSpace: config.get('romajiExpansion.autoExpandOnSpace', false),
        includeEnglishAliases: config.get('romajiExpansion.includeEnglishAliases', true)
    };
}

export function getHajimuDiagnosticsConfig(scope?: vscode.Uri): HajimuDiagnosticsConfig {
    const config = vscode.workspace.getConfiguration('hajimu', scope);
    return {
        undefinedIdentifiers: config.get('diagnostics.undefinedIdentifiers', true)
    };
}

export function getHajimuFormatTabSize(scope?: vscode.Uri): number {
    return vscode.workspace.getConfiguration('hajimu', scope).get('format.tabSize', 4);
}
