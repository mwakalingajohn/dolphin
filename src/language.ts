export interface Language {
    name: string,
    extension: string | Array<any>,
    description?: string,
    key: string,
    has: Array<string>
}