import * as vscode from 'vscode'; 
import { CreatePhpClassCommand } from './commands';
import { register } from './lib/util';



export function activate(context: vscode.ExtensionContext) { 
	register(context, new CreatePhpClassCommand(context), "createPhpClass")
}

export function deactivate() { }
