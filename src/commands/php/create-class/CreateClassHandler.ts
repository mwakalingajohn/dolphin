import * as path from "path";
import { window } from "vscode";
import { DialogOptions, ExecuteOptions, GetSourcePathOptions } from "../../Handler";
import { BaseHandler } from "../../BaseHandler";
import { DolphinFile } from "../../../lib/File";
import expand from "brace-expansion"

export interface NewFileDialogOptions extends Omit<DialogOptions, "uri"> {
    relativeToRoot?: boolean;
    ignoreIfNotExists?: boolean;
}

export interface NewFileExecuteOptions extends ExecuteOptions {
    isDir?: boolean;
}

export class CreateClassHandler extends BaseHandler {

    public async gatherDetails(options: NewFileDialogOptions): Promise<any> {
        let details = {}
        let className = await window.showInputBox({ title: "What is the name of the class?" })
        if (!className) {
            throw new Error("Class not selected");
        }
        
        let classExtends = await window.showInputBox({ title: "Class extends" })

        details = { ...details, className, classExtends }
        return details
    }

    public async run(options: NewFileExecuteOptions): Promise<DolphinFile> {
        const { file, isDir = false } = options
        await this.ensureWritableFile(file);
        try {
            return file.create(isDir, "content");
        } catch (e) {
            throw new Error(`Error creating file '${file.path}'.`);
        }
    }
}
