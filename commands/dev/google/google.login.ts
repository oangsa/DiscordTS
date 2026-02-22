import SubCommand from "../../../classes/SubCommand";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type CustomClient from "../../../classes/CustomClient";

export default class GoogleLogin extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "googledev.login",
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            await interaction.deferReply({ flags: "Ephemeral" });

            // Ensure user exists in database, create if not
            const userSearch = await this.client.services.users.searchUsers({
                search: [{ name: "discordId", condition: "equals", value: interaction.user.id }],
                pageSize: 1
            });

            let userId: string;

            if (userSearch.data.length === 0) {
                const newUser = await this.client.services.users.createUser({
                    discordId: interaction.user.id,
                    username: interaction.user.username,
                    globalName: interaction.user.globalName ?? undefined,
                    avatarUrl: interaction.user.displayAvatarURL() ?? undefined
                });
                userId = newUser.id;
            } else {
                userId = userSearch.data[0].id;
            }

            // Check if user already has a Google account linked
            const existingAccounts = await this.client.services.googleAccounts.searchGoogleAccounts({
                search: [{ name: "userId", condition: "equals", value: userId }],
                pageSize: 1
            });

            if (existingAccounts.data.length > 0) {
                const account = existingAccounts.data[0];
                const alreadyLinkedEmbed = new EmbedBuilder()
                    .setColor("#FF9800")
                    .setTitle("🔗 Already Connected")
                    .setDescription(
                        "Your Google account is already linked!\n\n" +
                        "Use `/googledev status` to view your connection details.\n" +
                        "Use `/googledev logout` first if you want to connect a different account."
                    )
                    .addFields(
                        { name: "Email", value: account.email ?? "Unknown", inline: true },
                        { name: "Connected Since", value: `<t:${Math.floor(new Date(account.connectedAt).getTime() / 1000)}:R>`, inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [alreadyLinkedEmbed] });
                return;
            }

            // Get the OAuth URL from the API
            const { url } = await this.client.services.googleAuth.getAuthUrl(interaction.user.id);

            // Create an embed with instructions
            const embed = new EmbedBuilder()
                .setColor("#4285F4") // Google blue
                .setTitle("🔐 Connect Your Google Calendar")
                .setDescription(
                    "To connect your Google Calendar, follow these steps:\n\n" +
                    "1. Click the button below to authorize access\n" +
                    "2. Sign in with your Google account\n" +
                    "3. Grant the necessary permissions\n" +
                    "4. You'll be redirected back and notified when complete\n\n" +
                    "**What we can access:**\n" +
                    "• Read and write to your Google Calendar\n" +
                    "• Create, update, and delete calendar events\n\n" +
                    "**Privacy Note:**\n" +
                    "Your data is stored securely and only used to sync events you create through this bot."
                )
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            // Create a button with the OAuth URL
            const button = new ButtonBuilder()
                .setLabel("Connect Google Calendar")
                .setStyle(ButtonStyle.Link)
                .setURL(url)
                .setEmoji("📅");

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(button);

            await interaction.editReply({
                embeds: [embed],
                components: [row]
            });

            // Use the user ID we already have for polling
            if (userId) {
                // Poll every 5 seconds for up to 2 minutes to detect successful connection
                const maxAttempts = 24;
                const pollInterval = 5000;

                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    await new Promise(resolve => setTimeout(resolve, pollInterval));

                    try {
                        const googleAccounts = await this.client.services.googleAccounts.searchGoogleAccounts({
                            search: [{ name: "userId", condition: "equals", value: userId }],
                            pageSize: 1
                        });

                        if (googleAccounts.data.length > 0) {
                            const account = googleAccounts.data[0];

                            const successEmbed = new EmbedBuilder()
                                .setColor("#4CAF50")
                                .setTitle("✅ Google Calendar Connected!")
                                .setDescription(
                                    "Your Google account has been successfully linked.\n\n" +
                                    "You can now use calendar commands to create and manage events that sync directly to your Google Calendar."
                                )
                                .addFields(
                                    { name: "Email", value: account.email ?? "Unknown", inline: true },
                                    { name: "Calendar ID", value: account.calendarId ?? "primary", inline: true }
                                )
                                .setTimestamp()
                                .setFooter({ text: "You can close the browser tab now", iconURL: interaction.user.displayAvatarURL() });

                            await interaction.editReply({
                                embeds: [successEmbed],
                                components: []
                            });
                            return;
                        }
                    } catch {
                        // Ignore polling errors, continue trying
                    }
                }

                // Timed out waiting for connection
                const timeoutEmbed = new EmbedBuilder()
                    .setColor("#FF9800")
                    .setTitle("⏰ Connection Timed Out")
                    .setDescription(
                        "We didn't detect a successful connection within 2 minutes.\n\n" +
                        "If you completed the authorization, use `/googledev status` to check.\n" +
                        "If not, try `/googledev login` again."
                    )
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [timeoutEmbed],
                    components: []
                });
            }

        } catch (error) {
            console.error("Error in GoogleLogin command:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("❌ Error")
                .setDescription(
                    "Failed to generate Google authentication URL. This might be because:\n\n" +
                    "• The API server is not running\n" +
                    "• Google OAuth is not properly configured\n" +
                    "• Network connection issues\n\n" +
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
