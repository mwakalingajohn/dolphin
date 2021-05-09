import * as vscode from "vscode";
import { Command } from "../commands/Command";

export function handleError(err: Error) {
    if (err && err.message) {
        vscode.window.showErrorMessage(err.message);
    }
    console.log(err)
    return err;
}

export function register(context: vscode.ExtensionContext, command: Command, name: string) {
    const callback = (...args: any) => command.run(...args).catch(handleError);
    const disposable = vscode.commands.registerCommand(`dolphin.${name}`, callback);
    context.subscriptions.push(disposable);
}