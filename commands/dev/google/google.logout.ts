import SubCommand from "../../../classes/SubCommand";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder } from "discord.js";
import type CustomClient from "../../../classes/CustomClient";

export default class GoogleLogout extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "googledev.logout",
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            await interaction.deferReply({ flags: "Ephemeral" });

            const discordId = interaction.user.id;

            // Check if user exists and has Google account
            let userId: string | null = null;
            let googleAccountId: string | null = null;

            try {
                const userSearchResult = await this.client.services.users.searchUsers({
                    search: [{ name: "discordId", condition: "equals", value: discordId }],
                    pageSize: 1
                });

                if (userSearchResult.data.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor("#FF9800")
                        .setTitle("❌ Not Connected")
                        .setDescription(
                            "You don't have a Google account linked.\n\n" +
                            "Use `/googledev login` to connect your Google Calendar."
                        )
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                userId = userSearchResult.data[0].id;

                // Check for Google account
                const googleAccountResult = await this.client.services.googleAccounts.searchGoogleAccounts({
                    search: [{ name: "userId", condition: "equals", value: userId }],
                    pageSize: 1
                });

                if (googleAccountResult.data.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor("#FF9800")
                        .setTitle("❌ Not Connected")
                        .setDescription(
                            "You don't have a Google account linked.\n\n" +
                            "Use `/googledev login` to connect your Google Calendar."
                        )
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                googleAccountId = googleAccountResult.data[0].id;

            } catch (apiError) {
                console.error("Error checking Google account:", apiError);
                const embed = new EmbedBuilder()
                    .setColor("#FF9800")
                    .setTitle("❌ Not Connected")
                    .setDescription("You don't have a Google Calendar connected to disconnect.")
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // Ask for confirmation
            const confirmEmbed = new EmbedBuilder()
                .setColor("#FF9800")
                .setTitle("⚠️ Confirm Disconnect")
                .setDescription(
                    "Are you sure you want to disconnect your Google Calendar?\n\n" +
                    "**This will:**\n" +
                    "• Remove your Google account connection\n" +
                    "• Stop syncing events to your calendar\n" +
                    "• Delete stored authentication tokens\n\n" +
                    "**Note:** This will NOT delete any events already in your Google Calendar."
                )
                .setTimestamp();

            const confirmButton = new ButtonBuilder()
                .setCustomId("confirm_logout")
                .setLabel("Yes, Disconnect")
                .setStyle(ButtonStyle.Danger)
                .setEmoji("🔓");

            const cancelButton = new ButtonBuilder()
                .setCustomId("cancel_logout")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("❌");

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(confirmButton, cancelButton);

            const response = await interaction.editReply({
                embeds: [confirmEmbed],
                components: [row]
            });

            // Wait for button interaction
            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: (i) => i.user.id === interaction.user.id,
                    componentType: ComponentType.Button,
                    time: 30_000 // 30 seconds
                });

                if (confirmation.customId === "confirm_logout") {
                    // Delete the Google account
                    await this.client.services.googleAccounts.deleteGoogleAccount(googleAccountId);

                    const successEmbed = new EmbedBuilder()
                        .setColor("#4CAF50")
                        .setTitle("✅ Disconnected")
                        .setDescription(
                            "Your Google Calendar has been successfully disconnected.\n\n" +
                            "You can reconnect at any time using `/google login`."
                        )
                        .setTimestamp();

                    await confirmation.update({
                        embeds: [successEmbed],
                        components: []
                    });

                } else {
                    const cancelEmbed = new EmbedBuilder()
                        .setColor("#9E9E9E")
                        .setTitle("Cancelled")
                        .setDescription("Your Google Calendar connection remains active.")
                        .setTimestamp();

                    await confirmation.update({
                        embeds: [cancelEmbed],
                        components: []
                    });
                }

            } catch (timeoutError) {
                // Timeout - user didn't respond
                console.error("Button interaction timeout:", timeoutError);
                const timeoutEmbed = new EmbedBuilder()
                    .setColor("#9E9E9E")
                    .setTitle("⏱️ Timed Out")
                    .setDescription("Confirmation timed out. Your Google Calendar connection remains active.")
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [timeoutEmbed],
                    components: []
                });
            }

        } catch (error) {
            console.error("Error in GoogleLogout command:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("❌ Error")
                .setDescription(
                    "Failed to disconnect Google Calendar.\n\n" +
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
