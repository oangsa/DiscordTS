import SubCommand from "../../classes/SubCommand";
import { ChatInputCommandInteraction } from "discord.js";
import type CustomClient from "../../classes/CustomClient";

export default class TestSub extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "test.one",
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply("Hello World!");
        return;
    }
}
