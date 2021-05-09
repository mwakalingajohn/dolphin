import { Uri } from "vscode";
import { DolphinFile } from "../lib/File";
import { Command, CommandConstructorOptions } from "./Command";
import { Handler } from "./Handler";

interface ExecuteControllerOptions {
    openFileInEditor?: boolean;
}

export abstract class BaseCommand<T extends Handler> implements Command {
    
    constructor(protected handler: T, readonly options?: CommandConstructorOptions) { }

    public abstract run(uri?: Uri): Promise<void>;

    protected async executeController(
        file: DolphinFile | undefined,
        options?: ExecuteControllerOptions
    ): Promise<void> { 
        if (file) {
            const result = await this.handler.run({ file });
            if (options?.openFileInEditor) {
                await this.handler.openFileInEditor(result);
            }
        }
    }
}
