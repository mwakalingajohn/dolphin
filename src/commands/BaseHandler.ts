import { commands, env, ExtensionContext, TextEditor, Uri, window, workspace, WorkspaceFolder } from "vscode";
import * as path from 'path'
import { DolphinFile } from "../lib/File";
import { Cache } from "../lib/Cache";
import { DialogOptions, ExecuteOptions, Handler, GetSourcePathOptions } from "./Handler";
import { getConfiguration } from "../lib/config";
import { TypeAhead } from "./TypeAhead";

export abstract class BaseHandler implements Handler {
    constructor(protected context: ExtensionContext) {}

    public abstract gatherDetails(options?: DialogOptions): any;

    public abstract run(options: ExecuteOptions): Promise<DolphinFile>;

    public async openFileInEditor(fileItem: DolphinFile): Promise<TextEditor | undefined> {
        if (fileItem.isDir) {
            return;
        }

        const textDocument = await workspace.openTextDocument(fileItem.path);
        if (!textDocument) {
            throw new Error("Could not open file!");
        }

        const editor = await window.showTextDocument(textDocument);
        if (!editor) {
            throw new Error("Could not show document!");
        }

        return editor;
    }

    public async closeCurrentFileEditor(): Promise<unknown> {
        return commands.executeCommand("workbench.action.closeActiveEditor");
    }

    public async _getSourcePath({ ignoreIfNotExists, uri }: GetSourcePathOptions = {}): Promise<string> {
        if (uri?.fsPath) {
            return uri.fsPath;
        }
        // Attempting to get the fileName from the activeTextEditor.
        // Works for text files only.
        const activeEditor = window.activeTextEditor;
        if (activeEditor && activeEditor.document && activeEditor.document.fileName) {
            return activeEditor.document.fileName;
        }

        // No activeTextEditor means that we don't have an active file or
        // the active file is a non-text file (e.g. binary files such as images).
        // Since there is no actual API to differentiate between the scenarios, we try to retrieve
        // the path for a non-textual file before throwing an error.
        const sourcePath = await this.getSourcePathForNonTextFile();
        if (!sourcePath && ignoreIfNotExists !== true) {
            throw new Error();
        }

        return sourcePath;
    }

    protected getCache(namespace: string): Cache {
        return new Cache(this.context.globalState, namespace);
    }

    protected async ensureWritableFile(fileItem: DolphinFile): Promise<DolphinFile> {
        if (!fileItem.exists) {
            return fileItem;
        }

        if (fileItem.targetPath === undefined) {
            throw new Error("Missing target path");
        }

        const message = `File '${fileItem.targetPath.path}' already exists.`;
        const action = "Overwrite";
        const overwrite = await window.showInformationMessage(message, { modal: true }, action);
        if (overwrite) {
            return fileItem;
        }
        throw new Error();
    }

    private async getSourcePathForNonTextFile(): Promise<string> {
        // Since there is no API to get details of non-textual files, the following workaround is performed:
        // 1. Saving the original clipboard data to a local variable.
        const originalClipboardData = await env.clipboard.readText();

        // 2. Populating the clipboard with an empty string
        await env.clipboard.writeText("");

        // 3. Calling the copyPathOfActiveFile that populates the clipboard with the source path of the active file.
        // If there is no active file - the clipboard will not be populated and it will stay with the empty string.
        await commands.executeCommand("workbench.action.files.copyPathOfActiveFile");

        // 4. Get the clipboard data after the API call
        const postAPICallClipboardData = await env.clipboard.readText();

        // 5. Return the saved original clipboard data to the clipboard so this method
        // will not interfere with the clipboard's content.
        await env.clipboard.writeText(originalClipboardData);

        // 6. Return the clipboard data from the API call (which could be an empty string if it failed).
        return postAPICallClipboardData;
    }

    public async getSourcePath({ relativeToRoot, ignoreIfNotExists }: GetSourcePathOptions): Promise<string> { 
        let rootPath = await (relativeToRoot ? this.getWorkspaceSourcePath() : this.getFileSourcePath({ ignoreIfNotExists }));
        
        if (rootPath === ".") {
            rootPath = await this.getWorkspaceSourcePath()
        }

        if (!rootPath) {
            throw new Error();
        }

        return this.getFileSourcePathAtRoot(rootPath, relativeToRoot === true);
    }

    private async getWorkspaceSourcePath(): Promise<string | undefined> {
        const workspaceFolder = await this.selectWorkspaceFolder();
        return workspaceFolder?.uri.fsPath;
    }

    private async selectWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
        if (workspace.workspaceFolders && workspace.workspaceFolders.length === 1) {
            return workspace.workspaceFolders[0];
        }

        const sourcePath = await this._getSourcePath({ ignoreIfNotExists: true });
        const uri = Uri.file(sourcePath);
        return workspace.getWorkspaceFolder(uri) || window.showWorkspaceFolderPick();
    }

    private async getFileSourcePath({ignoreIfNotExists = true}): Promise<string> {
        return path.dirname(await this._getSourcePath({ignoreIfNotExists}));
    }

    private async getFileSourcePathAtRoot(rootPath: string, relativeToRoot: boolean): Promise<string> {
        let sourcePath = rootPath;

        if (getConfiguration("typeahead.enabled") === true) {
            const cache = this.getCache(`workspace:${sourcePath}`);
            const typeAhead = new TypeAhead(cache, relativeToRoot);
            sourcePath = await typeAhead.showDialog(sourcePath);
        }

        if (!sourcePath) {
            throw new Error();
        }

        return sourcePath;
    }
}
