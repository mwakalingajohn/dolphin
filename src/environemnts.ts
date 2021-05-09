import { Language } from "./language";

export class WorkspaceEnvironments {
    environments: Language[] = [
        {
            name: "PHP",
            extension: ".php",
            key: Keys.php,
            has: [Keys.php],
            description: "This is php project"
        },
        {
            name: "Laravel",
            extension: [".php", ".blade"],
            key: Keys.laravel,
            has: [Keys.php],
            description: "This is a php project with blade files"
        },
        {
            name: "Typescript",
            extension: [".ts"],
            key: Keys.typescript,
            has: [Keys.typescript],
            description: "This is a typescript project",
        },
        {
            name: "Angular",
            extension: [".ts"],
            key: Keys.angular,
            has: [Keys.typescript],
            description: "This is an angular project with typescript files"
        }
    ]

    get() {
        return this.environments.map((value) => {
            return { name: value.name, description: value.description }
        })
    }
}