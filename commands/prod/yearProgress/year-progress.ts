import {
    ApplicationCommandOptionType,
    ChannelType,
    ChatInputCommandInteraction,
    PermissionsBitField,
} from "discord.js";
import Command from "../../../classes/Command";
import type CustomClient from "../../../classes/CustomClient";
import { Category } from "../../../enums/Category";

export default class YearProgress extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "year-progress",
            description: "Configure year progress updates",
            category: Category.Utilities,
            options: [
                {
                    name: "register",
                    description: "Set the year progress channel",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "channel_id",
                            description: "Channel for year progress updates",
                            type: ApplicationCommandOptionType.Channel,
                            channel_types: [ChannelType.GuildText],
                            required: true,
                        },
                    ],
                },
                {
                    name: "revoke",
                    description: "Stop year progress updates",
                    type: ApplicationCommandOptionType.Subcommand,
                },
            ],
            defaultMemberPermissions: PermissionsBitField.Flags.ManageGuild,
            dmPermissions: false,
            cooldown: 3,
            dev: false,
        });
    }

    public Execute(interaction: ChatInputCommandInteraction): void {
        void interaction.reply({
            content: "Use `/year-progress register` or `/year-progress revoke`.",
            flags: "Ephemeral",
        });
    }
}
