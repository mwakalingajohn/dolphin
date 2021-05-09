import { ExtensionContext } from "vscode";
import { BaseCommand } from "../../BaseCommand";
import { CommandConstructorOptions } from "../../Command";
import { CreateClassHandler } from "./CreateClassHandler";

export class CreateClassCommand extends BaseCommand<CreateClassHandler> {

    constructor(private context: ExtensionContext, readonly option?: CommandConstructorOptions) {
        super(new CreateClassHandler(context), option);
    }

    public async run(): Promise<void> { 
        
        const relativeToRoot = this.options?.relativeToRoot ?? false;
        const dialogOptions = { prompt: "Class Name", relativeToRoot };
        const fileItems = await this.handler.gatherDetails(dialogOptions);

        if (fileItems) {
            const executions = [...fileItems].map(async (file) => {
                const result = await this.handler.run({ file });
                await this.handler.openFileInEditor(result);
            });
            await Promise.all(executions);
        }
    }
}
