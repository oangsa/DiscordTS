import { ChannelType, EmbedBuilder, Events, type GuildMember } from "discord.js";
import type CustomClient from "../../classes/CustomClient";
import Event from "../../classes/Event";

export default class GuildMemberAdd extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.GuildMemberAdd,
            description: "Send the configured welcome message",
            isOnce: false,
            client,
        });
    }

    public async Execute(member: GuildMember): Promise<void> {
        try {
            const guild = await this.client.prisma.guild.findUnique({
                where: { discordId: member.guild.id },
                include: { welcomeLeaveConfig: true },
            });
            const channelId = guild?.welcomeLeaveConfig?.channelId;

            if (!channelId) return;

            const channel = await member.guild.channels.fetch(channelId);
            if (!channel || channel.type !== ChannelType.GuildText) {
                console.error(`Configured welcome/leave channel ${channelId} is unavailable in guild ${member.guild.id}.`);
                return;
            }

            const embed = new EmbedBuilder()
                .setColor("#00BFFF")
                .setTitle(`Welcome To ${member.guild.name}`)
                .setDescription("Welcome to our server from my open heart ❤️ I hope we would have a good journey together.")
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await channel.send({
                content: `<@${member.id}> Joined The Server!`,
                embeds: [embed],
            });
        } catch (error) {
            console.error(`Failed to send welcome message for guild ${member.guild.id}:`, error);
        }
    }
}
