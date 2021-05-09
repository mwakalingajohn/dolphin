import { Uri } from "vscode";

export interface CommandConstructorOptions {
    relativeToRoot?: boolean;
}

export interface Command {
    run(uri?: Uri): Promise<void>;   
}