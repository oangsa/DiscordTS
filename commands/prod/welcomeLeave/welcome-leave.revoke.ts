import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from "discord.js";
import SubCommand from "../../../classes/SubCommand";
import type CustomClient from "../../../classes/CustomClient";

export default class WelcomeLeaveRevoke extends SubCommand {
    constructor(client: CustomClient) {
        super(client, { name: "welcome-leave.revoke" });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
                await interaction.editReply("You need the Manage Server permission to use this command.");
                return;
            }

            if (!interaction.guildId) {
                await interaction.editReply("This command can only be used in a server.");
                return;
            }

            const guild = await this.client.prisma.guild.findUnique({
                where: { discordId: interaction.guildId },
                select: { id: true },
            });

            if (!guild) {
                await interaction.editReply("Welcome and leave messages are not configured.");
                return;
            }

            const result = await this.client.prisma.welcomeLeaveConfig.deleteMany({
                where: { guildId: guild.id },
            });

            await interaction.editReply(
                result.count > 0
                    ? "Welcome and leave messages have been disabled."
                    : "Welcome and leave messages are not configured.",
            );
        } catch (error) {
            console.error("Failed to revoke welcome/leave channel:", error);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply("Could not remove the welcome and leave channel.");
            } else {
                await interaction.reply({
                    content: "Could not remove the welcome and leave channel.",
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    }
}
