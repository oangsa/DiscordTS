import { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../../../classes/Command";
import CustomClient from "../../../classes/CustomClient";
import { Category } from "../../../enums/Category";

export default class EventScheduler extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "event",
            description: "Event scheduler commands with Google Calendar sync",
            category: Category.Utilities,
            options: [
                {
                    name: "create",
                    description: "Create a new scheduled event",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "title",
                            description: "Title of the event",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                        {
                            name: "date",
                            description: "Date of the event (YYYY-MM-DD)",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                        {
                            name: "start_time",
                            description: "Start time (HH:MM in 24h format, e.g. 14:30)",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                        {
                            name: "end_time",
                            description: "End time (HH:MM in 24h format, e.g. 16:00)",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                        {
                            name: "channel",
                            description: "Voice channel for the event",
                            type: ApplicationCommandOptionType.Channel,
                            channelTypes: [ChannelType.GuildVoice, ChannelType.GuildStageVoice],
                            required: true,
                        },
                        {
                            name: "description",
                            description: "Description of the event",
                            type: ApplicationCommandOptionType.String,
                            required: false,
                        },
                        {
                            name: "participants",
                            description: "Mention participants (e.g. @user1 @user2 @user3)",
                            type: ApplicationCommandOptionType.String,
                            required: false,
                        },
                    ],
                },
                {
                    name: "upcoming",
                    description: "View upcoming scheduled events",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "limit",
                            description: "Number of events to show (default: 5)",
                            type: ApplicationCommandOptionType.Integer,
                            required: false,
                            minValue: 1,
                            maxValue: 25,
                        },
                    ],
                },
            ],
            defaultMemberPermissions: PermissionsBitField.Flags.UseApplicationCommands,
            dmPermissions: false,
            cooldown: 5,
            dev: true,
        });
    }

    Execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({
            content: "Please use a subcommand: /eventsschedulerdev create, /eventsschedulerdev upcoming",
            flags: "Ephemeral",
        });
    }
}
