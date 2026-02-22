import SubCommand from "../../../classes/SubCommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type CustomClient from "../../../classes/CustomClient";
import { EventStatus } from "../../../types/enums";

export default class EventSchedulerUpcoming extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "eventsschedulerdev.upcoming",
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            await interaction.deferReply({ flags: "Ephemeral" });

            const limit = interaction.options.getInteger("limit") ?? 5;

            // Look up the internal user record by Discord ID
            const userResult = await this.client.services.users.searchUsers({
                search: [{ name: "discordId", condition: "equals", value: interaction.user.id }],
                pageSize: 1,
                pageNumber: 1,
            });

            if (userResult.data.length === 0) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF9800")
                            .setTitle("📅 Upcoming Events")
                            .setDescription("No upcoming events found.")
                            .setTimestamp(),
                    ],
                });
                return;
            }

            const internalUserId = userResult.data[0].id;

            // Search for upcoming scheduled events for this user, ordered by start time
            const now = new Date().toISOString();
            const result = await this.client.services.events.searchEvents({
                search: [
                    { name: "status", condition: "equals", value: EventStatus.SCHEDULED },
                    { name: "startTime", condition: "greaterThanOrEqual", value: now },
                    { name: "createdBy", condition: "equals", value: internalUserId },
                ],
                orderBy: "StartTime asc",
                pageSize: limit,
                pageNumber: 1,
            });

            if (result.data.length === 0) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF9800")
                            .setTitle("📅 Upcoming Events")
                            .setDescription("No upcoming events found.")
                            .setTimestamp(),
                    ],
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor("#4285F4")
                .setTitle(`📅 Upcoming Events (${result.data.length}/${result.meta.totalCount})`)
                .setTimestamp();

            for (const event of result.data) {
                const startTimestamp = Math.floor(new Date(event.startTime).getTime() / 1000);
                const endTimestamp = Math.floor(new Date(event.endTime).getTime() / 1000);

                const fieldValue = [
                    `🕐 <t:${startTimestamp}:F> → <t:${endTimestamp}:t>`,
                    event.description ? `📝 ${event.description.substring(0, 100)}` : null,
                    `🆔 \`${event.id}\``,
                ].filter(Boolean).join("\n");

                embed.addFields({
                    name: event.title,
                    value: fieldValue,
                    inline: false,
                });
            }

            if (result.meta.totalCount > limit) {
                embed.setFooter({
                    text: `Showing ${result.data.length} of ${result.meta.totalCount} events • Use /eventsschedulerdev upcoming limit:${limit + 5} to see more`,
                });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Error fetching upcoming events:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("❌ Error")
                .setDescription("Failed to fetch upcoming events. Please try again later.")
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: "Ephemeral" });
            }
        }
    }
}
