import type IHandler from "../interfaces/IHandler";
import path from "path";
import Command from "./Command";
import SubCommand from "./SubCommand";
import { glob } from "glob";
import CustomClient from "./CustomClient";

export default class Handlers implements IHandler {
    private client: CustomClient;

    constructor(client: CustomClient) {
        this.client = client;
    }

    public async LoadCommands(): Promise<void> {
        const files: string[] = (await glob("commands/**/*.ts")).map(filePath => path.resolve(filePath));

        files.map(async (file: string) => {
            const cmd: Command | SubCommand = new(await import(file)).default(this.client);

            if (!cmd.name) return delete require.cache[require.resolve(file)] && console.log(`${file.split("/").pop()} does not have name.`)

            if (file.split("\\").pop()?.split(".")[1] && file.split("\\").pop()?.split(".")[1] != "ts") {
                return this.client.subCommands.set(cmd.name, cmd)
            }

            this.client.commands.set(cmd.name, cmd as Command);

            return delete require.cache[require.resolve(file)];

        });
    }

    public async LoadEvents(): Promise<void> {

        const files: string[] = (await glob("events/**/*.ts")).map(filePath => path.resolve(filePath));

        files.map(async (file: string) => {

            const event = new (await import(file)).default(this.client);

            if (!event.name) return delete require.cache[require.resolve(file)] && console.log(`${file.split("/").pop()} does not have name.`)

            if (event.isOnce) {
                this.client.once(event.name, (...args: any) => event.Execute(...args));
            }
            else {
                this.client.on(event.name, (...args: any) => event.Execute(...args));
            }

            return delete require.cache[require.resolve(file)];
        });
    }
}
