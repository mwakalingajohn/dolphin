import * as fs from "fs";
import * as path from "path";
import { Uri, workspace, WorkspaceEdit } from "vscode";

function assertTargetPath(targetPath: Uri | undefined): asserts targetPath is Uri {
    if (targetPath === undefined) {
        throw new Error("Missing target path");
    }
}

export class DolphinFile {
    private SourcePath: Uri;
    private TargetPath: Uri | undefined;

    constructor(sourcePath: Uri | string, targetPath?: Uri | string, private IsDir: boolean = false) {
        this.SourcePath = this.toUri(sourcePath);
        if (targetPath !== undefined) {
            this.TargetPath = this.toUri(targetPath);
        }
    }

    get name(): string {
        return path.basename(this.SourcePath.path);
    }

    get path(): Uri {
        return this.SourcePath;
    }

    get targetPath(): Uri | undefined {
        return this.TargetPath;
    }

    get exists(): boolean {
        if (this.targetPath === undefined) {
            return false;
        }
        return fs.existsSync(this.targetPath.fsPath);
    }

    get isDir(): boolean {
        return this.IsDir;
    }

    public async move(): Promise<DolphinFile> {
        assertTargetPath(this.targetPath);

        const edit = new WorkspaceEdit();
        edit.renameFile(this.path, this.targetPath, { overwrite: true });
        await workspace.applyEdit(edit);

        this.SourcePath = this.targetPath;
        return this;
    }

    public async duplicate(): Promise<DolphinFile> {
        assertTargetPath(this.targetPath);

        await workspace.fs.copy(this.path, this.targetPath, { overwrite: true });

        return new DolphinFile(this.targetPath, undefined, this.isDir);
    }

    public async remove(): Promise<DolphinFile> {
        const edit = new WorkspaceEdit();
        edit.deleteFile(this.path, { recursive: true, ignoreIfNotExists: true });
        await workspace.applyEdit(edit);
        return this;
    }

    public async create(mkDir?: boolean, content: any = new Uint8Array()): Promise<DolphinFile> {
        assertTargetPath(this.targetPath);

        if (this.exists) {
            await workspace.fs.delete(this.targetPath, { recursive: true });
        }

        if (mkDir === true || this.isDir) {
            await workspace.fs.createDirectory(this.targetPath);
        } else {
            await fs.writeFileSync(this.targetPath.fsPath, content);
        }

        return new DolphinFile(this.targetPath, undefined, this.isDir);
    }

    private toUri(uriOrString: Uri | string): Uri {
        return uriOrString instanceof Uri ? uriOrString : Uri.file(uriOrString);
    }
}
