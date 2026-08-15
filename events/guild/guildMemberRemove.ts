import { ChannelType, EmbedBuilder, Events, type GuildMember } from "discord.js";
import type CustomClient from "../../classes/CustomClient";
import Event from "../../classes/Event";

export default class GuildMemberRemove extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.GuildMemberRemove,
            description: "Send the configured leave message",
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
                .setColor("Red")
                .setTitle(`Goodbye From ${member.guild.name}`)
                .setDescription("Thanks for being part of our server. We hope to see you again.")
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await channel.send({
                content: `**${member.user.tag}** Left The Server!`,
                embeds: [embed],
            });
        } catch (error) {
            console.error(`Failed to send leave message for guild ${member.guild.id}:`, error);
        }
    }
}
