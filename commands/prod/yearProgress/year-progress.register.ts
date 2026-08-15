import {
    ChannelType,
    ChatInputCommandInteraction,
    MessageFlags,
    PermissionFlagsBits,
} from "discord.js";
import SubCommand from "../../../classes/SubCommand";
import type CustomClient from "../../../classes/CustomClient";

export default class YearProgressRegister extends SubCommand {
    constructor(client: CustomClient) {
        super(client, { name: "year-progress.register" });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
                await interaction.editReply("You need the Manage Server permission to use this command.");
                return;
            }

            const guild = interaction.guild;
            const channel = interaction.options.getChannel("channel_id", true, [ChannelType.GuildText]);
            const botMember = guild?.members.me;

            if (!guild || !botMember || channel.type !== ChannelType.GuildText) {
                await interaction.editReply("This command can only register a server text channel.");
                return;
            }

            const canPost = channel.permissionsFor(botMember)?.has([
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
            ]);

            if (!canPost) {
                await interaction.editReply("I need View Channel and Send Messages permissions in that channel.");
                return;
            }

            const storedGuild = await this.client.prisma.guild.upsert({
                where: { discordId: guild.id },
                update: { name: guild.name },
                create: { discordId: guild.id, name: guild.name },
            });

            await this.client.prisma.yearProgressConfig.upsert({
                where: { guildId: storedGuild.id },
                update: {
                    channelId: channel.id,
                    registeredById: interaction.user.id,
                },
                create: {
                    guildId: storedGuild.id,
                    channelId: channel.id,
                    registeredById: interaction.user.id,
                },
            });

            await interaction.editReply(`Year progress updates will be sent in ${channel}.`);
        } catch (error) {
            console.error("Failed to register year progress channel:", error);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply("Could not save the year progress channel.");
            } else {
                await interaction.reply({
                    content: "Could not save the year progress channel.",
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    }
}
