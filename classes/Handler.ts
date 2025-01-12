import type IHandler from "../interfaces/IHandler";
import path from "path";
import Command from "./Command";
import SubCommand from "./SubCommand";
import { glob } from "glob";
import CustomClient from "./CustomClient";
import { EmbedBuilder, WebhookClient } from "discord.js";
import { inspect } from "util";

export default class Handlers implements IHandler {
    private client: CustomClient;
    private webkook: WebhookClient = new WebhookClient({ url: process.env.ANTICRASH_WEBHOOK as string });
    private embed = new EmbedBuilder()

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

    public LoadAntiCrash(): void {
        this.client.on("error", async (err: Error) => {
            console.error(err);

            this.embed.setTitle("**Discord API Error**")
            .setURL("https://discordjs.guide/popular-topics/errors.html#api-errors")
            .setColor("#2F3136")
            .setDescription(`\`\`\`${inspect(err, { depth: 0 }).slice(0, 1000)}\`\`\``)
            .setTimestamp();

            await this.webkook.send({ embeds: [this.embed], username: `SomSri's Handler - AntiCrash` });
            return;
        });

        // Handle bun error
        process.on("uncaughtException", async (err: Error, origin: NodeJS.UncaughtExceptionOrigin) => {
            console.log(err, "\n", origin);

            this.embed.setTitle("**Uncaught Exception/Catch**")
            .setColor("Red")
            .addFields(
                { name: "Error", value: `\`\`\`${inspect(err, { depth: 0 }).slice(0, 1000)}\`\`\`` },
                { name: "Origin", value: `\`\`\`${inspect(origin, { depth: 0 }).slice(0, 1000)}\`\`\`` }
            )
            .setTimestamp();

            await this.webkook.send({ embeds: [this.embed], username: `SomSri's Handler - AntiCrash` });
            return;
        });

        // Handle promise rejection
        process.on("unhandledRejection", async (reason: NodeJS.UnhandledRejectionListener, promise: NodeJS.UnhandledRejectionListener) => {
            console.log(reason, "\n", promise);

            this.embed.setTitle("**Unhandled Rejection/Catch**")
            .setColor("Red")
            .addFields(
                { name: "Reason", value: `\`\`\`${inspect(reason, { depth: 0 }).slice(0, 1000)}\`\`\`` },
                { name: "Promise", value: `\`\`\`${inspect(promise, { depth: 0 }).slice(0, 1000)}\`\`\`` }
            )
            .setTimestamp();

            await this.webkook.send({ embeds: [this.embed], username: `SomSri's Handler - AntiCrash` });
            return;
        });

        // handle exceptions error
        process.on("uncaughtExceptionMonitor", async (err: Error, origin: NodeJS.UncaughtExceptionOrigin) => {
            console.log(err, "\n", origin);

            this.embed.setTitle("**Uncaught Exception Monitor**")
            .setColor("Red")
            .addFields(
                { name: "Error", value: `\`\`\`${inspect(err, { depth: 0 }).slice(0, 1000)}\`\`\`` },
                { name: "Origin", value: `\`\`\`${inspect(origin, { depth: 0 }).slice(0, 1000)}\`\`\`` }
            )
            .setTimestamp();

            await this.webkook.send({ embeds: [this.embed], username: `SomSri's Handler - AntiCrash` });
            return;
        });

        // Handle warnings
        process.on("warning", async (warning: NodeJS.WarningListener) => {
            console.log(warning);

            this.embed.setTitle("**Uncaught Exception Monitor Warning**")
            .setColor("Yellow")
            .setDescription(`\`\`\`${inspect(warning, { depth: 0 }).slice(0, 1000)}\`\`\``)
            .setTimestamp();

            await this.webkook.send({ embeds: [this.embed], username: `SomSri's Handler - AntiCrash` });
            return;
        });
    }
}
