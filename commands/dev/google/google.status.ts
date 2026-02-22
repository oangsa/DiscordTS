import SubCommand from "../../../classes/SubCommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type CustomClient from "../../../classes/CustomClient";

export default class GoogleStatus extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "googledev.status",
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            await interaction.deferReply({ flags: "Ephemeral" });

            // Try to find the user in the database
            const discordId = interaction.user.id;

            try {
                // Search for user by discord_id
                const userSearchResult = await this.client.services.users.searchUsers({
                    search: [{ name: "discordId", condition: "equals", value: discordId }],
                    pageSize: 1
                });

                if (userSearchResult.data.length === 0) {
                    // User not found
                    const embed = new EmbedBuilder()
                        .setColor("#FF9800") // Orange
                        .setTitle("📊 Connection Status")
                        .setDescription(
                            "❌ **Not Connected**\n\n" +
                            "You haven't connected your Google Calendar yet.\n\n" +
                            "Use `/google login` to connect your account."
                        )
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                const user = userSearchResult.data[0];

                // Check if user has a Google account linked
                const googleAccountResult = await this.client.services.googleAccounts.searchGoogleAccounts({
                    search: [{ name: "userId", condition: "equals", value: user.id }],
                    pageSize: 1
                });

                if (googleAccountResult.data.length === 0) {
                    // User exists but no Google account linked
                    const embed = new EmbedBuilder()
                        .setColor("#FF9800") // Orange
                        .setTitle("📊 Connection Status")
                        .setDescription(
                            "❌ **Not Connected**\n\n" +
                            "You haven't connected your Google Calendar yet.\n\n" +
                            "Use `/google login` to connect your account."
                        )
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                const googleAccount = googleAccountResult.data[0];

                // User has a Google account linked
                const embed = new EmbedBuilder()
                    .setColor("#4CAF50") // Green
                    .setTitle("📊 Connection Status")
                    .setDescription("✅ **Connected**")
                    .addFields(
                        { name: "Google Email", value: googleAccount.email ?? "Unknown", inline: true },
                        { name: "Calendar ID", value: googleAccount.calendarId ?? "primary", inline: true },
                        { name: "Connected Since", value: `<t:${Math.floor(new Date(googleAccount.connectedAt).getTime() / 1000)}:R>`, inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: "Your calendar is ready to use!" });

                await interaction.editReply({ embeds: [embed] });

            } catch (apiError) {
                // Handle 404 or other API errors
                console.error("Error fetching Google account status:", apiError);
                const embed = new EmbedBuilder()
                    .setColor("#FF9800") // Orange
                    .setTitle("📊 Connection Status")
                    .setDescription(
                        "❌ **Not Connected**\n\n" +
                        "You haven't connected your Google Calendar yet.\n\n" +
                        "Use `/google login` to connect your account."
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error("Error in GoogleStatus command:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("❌ Error")
                .setDescription(
                    "Failed to check connection status.\n\n" +
                    "Please contact a server administrator."
                )
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: "Ephemeral" });
            }
        }
    }
}
