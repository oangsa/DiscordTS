import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../../../classes/Command";
import CustomClient from "../../../classes/CustomClient";
import { Category } from "../../../enums/Category";

export default class Google extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "google",
            description: "Google Calendar integration commands",
            category: Category.Utilities,
            options: [
                {
                    name: "login",
                    description: "Connect your Google Calendar account",
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: "status",
                    description: "Check your Google Calendar connection status",
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: "logout",
                    description: "Disconnect your Google Calendar account",
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ],
            defaultMemberPermissions: PermissionsBitField.Flags.UseApplicationCommands,
            dmPermissions: true,
            cooldown: 3,
            dev: false
        })
    }

    Execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({
            content: "Please use a subcommand: /google login, /google status, or /google logout",
            flags: "Ephemeral"
        })
    }
}
