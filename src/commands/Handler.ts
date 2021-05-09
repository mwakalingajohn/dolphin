import { TextEditor, Uri } from "vscode";
import { DolphinFile } from "../lib/File";

export interface DialogOptions {
    prompt?: string;
    uri?: Uri;
}

export interface ExecuteOptions {
    file: DolphinFile;
}

export interface GetSourcePathOptions {
    relativeToRoot?: boolean;
    ignoreIfNotExists?: boolean;
    uri?: Uri;
}

export interface Handler {
    gatherDetails(options?: DialogOptions): any;
    run(options: ExecuteOptions): Promise<DolphinFile>;
    openFileInEditor(file: DolphinFile): Promise<TextEditor | undefined>;
    closeCurrentFileEditor(): Promise<unknown>;
    getSourcePath(options?: GetSourcePathOptions): Promise<string>;
}
