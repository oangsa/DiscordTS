import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from "discord.js";
import SubCommand from "../../../classes/SubCommand";
import type CustomClient from "../../../classes/CustomClient";

export default class YearProgressRevoke extends SubCommand {
    constructor(client: CustomClient) {
        super(client, { name: "year-progress.revoke" });
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
                await interaction.editReply("Year progress updates are not configured.");
                return;
            }

            const result = await this.client.prisma.yearProgressConfig.deleteMany({
                where: { guildId: guild.id },
            });

            await interaction.editReply(
                result.count > 0
                    ? "Year progress updates have been disabled."
                    : "Year progress updates are not configured.",
            );
        } catch (error) {
            console.error("Failed to revoke year progress channel:", error);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply("Could not remove the year progress channel.");
            } else {
                await interaction.reply({
                    content: "Could not remove the year progress channel.",
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    }
}
