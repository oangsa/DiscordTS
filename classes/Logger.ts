import { EmbedBuilder, WebhookClient } from "discord.js";
import type ILogger from "../interfaces/ILogger";
import type CustomClient from "./CustomClient";

export default class Logger implements ILogger {
    client: CustomClient;

    private embed = new EmbedBuilder();
    private webhook = new WebhookClient({ url: process.env.ANTICRASH_WEBHOOK as string });

    constructor(client: CustomClient) {
        this.client = client;
    }

    public async log(message: string): Promise<void> {
        this.embed.setColor("Blurple").setDescription(message).setTitle("📝 Log");

        await this.webhook.send({ embeds: [this.embed], username: "SomSri's Handler - Logger" });
    }

    public async error(message: string): Promise<void> {
        console.error(message);
    }

    public async warn(message: string): Promise<void> {
        this.embed.setColor("Yellow").setDescription(message).setTitle("⚠️ Warning");

        await this.webhook.send({ embeds: [this.embed], username: "SomSri's Handler - Logger" });
    }
}
