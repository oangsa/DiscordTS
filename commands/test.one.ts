import SubCommand from "../classes/SubCommand";
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import type CustomClient from "../classes/CustomClient";

export default class TestSub extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "test.one",
        });
    }

    public Execute(interaction: ChatInputCommandInteraction): void {
        interaction.reply("Hello World!");
    }
}
