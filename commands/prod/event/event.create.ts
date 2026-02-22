import SubCommand from "../../../classes/SubCommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type CustomClient from "../../../classes/CustomClient";
import { ParticipantRole } from "../../../types/enums";

export default class EventSchedulerCreate extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "event.create",
        });
    }

    private async ensureUser(discordId: string, username: string, globalName?: string, avatarUrl?: string): Promise<string> {
        const search = await this.client.services.users.searchUsers({
            search: [{ name: "discordId", condition: "equals", value: discordId }],
            pageSize: 1,
        });

        if (search.data.length === 0) {
            const newUser = await this.client.services.users.createUser({
                discordId,
                username,
                globalName,
                avatarUrl,
            });
            return newUser.id;
        }

        return search.data[0].id;
    }

    private async isGoogleLinked(userId: string): Promise<boolean> {
        try {
            const result = await this.client.services.googleAccounts.searchGoogleAccounts({
                search: [{ name: "userId", condition: "equals", value: userId }],
                pageSize: 1,
            });
            return result.data.length > 0;
        } catch {
            return false;
        }
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            await interaction.deferReply();

            // Parse options
            const title = interaction.options.getString("title", true);
            const date = interaction.options.getString("date", true);
            const startTimeStr = interaction.options.getString("start_time", true);
            const endTimeStr = interaction.options.getString("end_time", true);
            const channel = interaction.options.getChannel("channel", true);
            const participantsRaw = interaction.options.getString("participants") ?? "";
            const description = interaction.options.getString("description") ?? undefined;

            // Parse mentioned user IDs from the participants string
            const mentionRegex = /<@!?(\d+)>/g;
            const mentionedIds = new Set<string>();
            let match: RegExpExecArray | null;
            while ((match = mentionRegex.exec(participantsRaw)) !== null) {
                mentionedIds.add(match[1]);
            }

            // Resolve Discord users and filter bots
            const resolvedUsers: { discordId: string; username: string; globalName?: string; avatarUrl?: string }[] = [];
            for (const id of mentionedIds) {
                try {
                    const user = await this.client.users.fetch(id);
                    if (!user.bot) {
                        resolvedUsers.push({
                            discordId: user.id,
                            username: user.username,
                            globalName: user.globalName ?? undefined,
                            avatarUrl: user.displayAvatarURL() ?? undefined,
                        });
                    }
                } catch {
                    // Skip unresolvable users
                }
            }

            // Validate date and time
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                await interaction.editReply({
                    embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("❌ Invalid Date").setDescription("Please use the format `YYYY-MM-DD` (e.g. `2026-03-15`).").setTimestamp()],
                });
                return;
            }

            if (!/^\d{2}:\d{2}$/.test(startTimeStr) || !/^\d{2}:\d{2}$/.test(endTimeStr)) {
                await interaction.editReply({
                    embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("❌ Invalid Time").setDescription("Please use 24h format `HH:MM` (e.g. `14:30`).").setTimestamp()],
                });
                return;
            }

            const startTime = new Date(`${date}T${startTimeStr}:00`);
            const endTime = new Date(`${date}T${endTimeStr}:00`);

            if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
                await interaction.editReply({
                    embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("❌ Invalid Date/Time").setDescription("The date or time you entered is not valid.").setTimestamp()],
                });
                return;
            }

            if (endTime <= startTime) {
                await interaction.editReply({
                    embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("❌ Invalid Time Range").setDescription("End time must be after start time.").setTimestamp()],
                });
                return;
            }

            // Ensure the creator exists in the database
            const creatorUserId = await this.ensureUser(
                interaction.user.id,
                interaction.user.username,
                interaction.user.globalName ?? undefined,
                interaction.user.displayAvatarURL() ?? undefined,
            );

            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";

            // Create the event
            const event = await this.client.services.events.createEvent({
                createdBy: creatorUserId,
                title,
                description: description
                    ? `${description}\n\n📍 Voice Channel: <#${channel.id}>`
                    : `📍 Voice Channel: <#${channel.id}>`,
                startTime,
                endTime,
                timezone,
            });

            // Add creator as owner participant
            await this.client.services.eventParticipants.addEventParticipant({
                eventId: event.id,
                userId: creatorUserId,
                role: ParticipantRole.OWNER,
            });

            // Process additional participants
            const addedParticipants: string[] = [`<@${interaction.user.id}> (owner)`];
            const unlinkedParticipants: string[] = [];
            const failedParticipants: string[] = [];

            const creatorIsLinked = await this.isGoogleLinked(creatorUserId);
            if (!creatorIsLinked) unlinkedParticipants.push(`<@${interaction.user.id}>`);

            for (const resolved of resolvedUsers) {
                try {
                    const participantUserId = await this.ensureUser(
                        resolved.discordId,
                        resolved.username,
                        resolved.globalName,
                        resolved.avatarUrl,
                    );

                    // Don't add creator twice as participant
                    if (participantUserId === creatorUserId) {
                        continue;
                    }

                    // Always add to database as participant
                    await this.client.services.eventParticipants.addEventParticipant({
                        eventId: event.id,
                        userId: participantUserId,
                        role: ParticipantRole.ATTENDEE,
                    });

                    addedParticipants.push(`<@${resolved.discordId}>`);

                    // Check if they have Google linked
                    const linked = await this.isGoogleLinked(participantUserId);
                    if (!linked) {
                        unlinkedParticipants.push(`<@${resolved.discordId}>`);
                    }
                } catch {
                    failedParticipants.push(`<@${resolved.discordId}>`);
                }
            }

            // Sync to Google Calendars (only syncs for linked users)
            let syncMessage = "";
            try {
                await this.client.services.calendarSync.syncEventToAll(event.id);
                if (unlinkedParticipants.length === 0) {
                    syncMessage = "📅 Synced to all participants' calendars";
                } else {
                    syncMessage = "📅 Synced to linked participants' calendars";
                }
            } catch {
                syncMessage = "⚠️ Calendar sync encountered issues";
            }

            // Build success embed
            const startTimestamp = Math.floor(startTime.getTime() / 1000);
            const endTimestamp = Math.floor(endTime.getTime() / 1000);
            const descriptionLine = description ? `\n${description}` : "";

            const successEmbed = new EmbedBuilder()
                .setColor("#4CAF50")
                .setTitle("✅ Event Created!")
                .setDescription(`**${title}**${descriptionLine}`)
                .addFields(
                    { name: "📅 Date & Time", value: `<t:${startTimestamp}:F> → <t:${endTimestamp}:t>`, inline: false },
                    { name: "⏱️ Duration", value: `${Math.round((endTime.getTime() - startTime.getTime()) / 60000)} minutes`, inline: true },
                    { name: "📍 Voice Channel", value: `<#${channel.id}>`, inline: true },
                    { name: `👥 Participants (${addedParticipants.length})`, value: addedParticipants.join("\n") || "None", inline: false },
                )
                .setFooter({ text: `Event ID: ${event.id} • ${syncMessage}` })
                .setTimestamp();

            if (unlinkedParticipants.length > 0) {
                successEmbed.addFields({
                    name: "⚠️ Google Calendar Not Linked",
                    value: unlinkedParticipants.join("\n") + "\n\nThese users are added as participants but won't receive calendar sync. They can use `/googledev login` to link their account.",
                    inline: false,
                });
            }

            if (failedParticipants.length > 0) {
                successEmbed.addFields({
                    name: "❌ Failed to Add",
                    value: failedParticipants.join("\n"),
                    inline: false,
                });
            }

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error("Error creating event:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("❌ Error")
                .setDescription(
                    "Failed to create event. Please try again later.\n\n" +
                    "If the problem persists, contact a server administrator."
                )
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed] });
            }
        }
    }
}
