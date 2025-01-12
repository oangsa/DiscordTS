import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../../classes/Command";
import CustomClient from "../../classes/CustomClient";
import { Category } from "../../enums/Category";

export default class test extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "test",
            description: "My test command",
            category: Category.Utilities,
            options: [
                {
                    name: "one",
                    description: "Test option one",
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ],
            defaultMemberPermissions: PermissionsBitField.Flags.UseApplicationCommands,
            dmPermissions: false,
            cooldown: 3,
            dev: true
        })
    }

    Execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({
            content: "It's working",
            flags: "Ephemeral"
        })
    }
}
