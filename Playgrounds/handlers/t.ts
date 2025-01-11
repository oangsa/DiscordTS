import fs from "fs";

export default class h {
    public async LoadCommands(): Promise<void> {
        const files: string[] = fs.readdirSync(`commands/`).filter(file => file.endsWith('.ts'));

        files.map(async (file: string) => {
            console.log(`Loading command ${file}...`);
        });
    }
}
