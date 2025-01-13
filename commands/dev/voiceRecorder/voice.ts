import { PermissionsBitField, ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import Command from "../../../classes/Command";
import type CustomClient from "../../../classes/CustomClient";
import { Category } from "../../../enums/Category";

export default class VoiceBaseCommand extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "voice",
            description: "Voice commands",
            category: Category.Utilities,
            defaultMemberPermissions: PermissionsBitField.Flags.UseApplicationCommands,
            dmPermissions: false,
            cooldown: 3,
            options: [
                {
                    name: "record",
                    description: "Start recording",
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: "stop",
                    description: "Stop recording",
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ],
            dev: true
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({
            content: "This command is not implemented yet",
            flags: "Ephemeral"
        });
    }
}
