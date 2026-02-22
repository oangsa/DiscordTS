import { ChatInputCommandInteraction, ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../../classes/Command";
import type CustomClient from "../../../classes/CustomClient";
import { Category } from "../../../enums/Category";

export default class music extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "musicdev",
            description: "Music commands (Deverloper)",
            category: Category.Utilities,
            defaultMemberPermissions: PermissionsBitField.Flags.UseApplicationCommands,
            dmPermissions: false,
            options: [
                {
                    name: "play",
                    description: "Play a song",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "query",
                            description: "The song you want to play",
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
                {
                    name: "repeat",
                    description: "Repeat the current song or queue",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "type",
                            description: "Select an option",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                { name: "Song", value: "track" },
                                { name: "Queue", value: "queue" },
                                { name: "Off", value: "none" }
                            ]
                        }
                    ],
                },
                {
                    name: "volume",
                    description: "Change the volume",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "volume",
                            description: "The volume you want to set (range: 0-100)",
                            type: ApplicationCommandOptionType.Integer,
                            required: true
                        }
                    ],
                },
                {
                    name: "settings",
                    description: "Setting the player",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "options",
                            description: "Select an option",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                { name: "View Queue", value: "queue" },
                                { name: "Clear Queue", value: "queueclear" },
                                { name: "Skip", value: "skip" },
                                { name: "Pause", value: "pause" },
                                { name: "Resume", value: "resume" },
                                { name: "Stop", value: "stop" },
                                { name: "Lyrics", value: "lyrics" },
                                { name: "Shuffle", value: "shuffle" },
                                { name: "Now Playing", value: "nowplaying" }
                            ]
                        }
                    ],
                }
            ],
            cooldown: 3,
            dev: true
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({
            content: "This command is not implemented yet",
            flags: "Ephemeral"
        })
    }
}
