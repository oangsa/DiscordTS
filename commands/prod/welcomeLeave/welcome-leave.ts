import {
    ApplicationCommandOptionType,
    ChannelType,
    ChatInputCommandInteraction,
    PermissionsBitField,
} from "discord.js";
import Command from "../../../classes/Command";
import type CustomClient from "../../../classes/CustomClient";
import { Category } from "../../../enums/Category";

export default class WelcomeLeave extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "welcome-leave",
            description: "Configure welcome and leave messages",
            category: Category.Utilities,
            options: [
                {
                    name: "register",
                    description: "Set the welcome and leave channel",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "channel_id",
                            description: "Channel for welcome and leave messages",
                            type: ApplicationCommandOptionType.Channel,
                            channel_types: [ChannelType.GuildText],
                            required: true,
                        },
                    ],
                },
                {
                    name: "revoke",
                    description: "Remove the welcome and leave channel",
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
            content: "Use `/welcome-leave register` or `/welcome-leave revoke`.",
            flags: "Ephemeral",
        });
    }
}
