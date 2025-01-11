import SubCommand from "../../classes/SubCommand";
import { ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import type CustomClient from "../../classes/CustomClient";
import type { KazagumoPlayer, KazagumoSearchResult } from "kazagumo";
import pms from "pretty-ms";

export default class MusicPlay extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "music.play",
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const { options, member, guild } = interaction;
        const embed = new EmbedBuilder().setColor("Blurple").setTimestamp();

        await interaction.deferReply();
        if (!(await this.checkVoice(interaction))) return;

        const player = await this.client.kazagumo.shoukaku.createPlayer({
            guildId: interaction.guild?.id as string,
            voiceId: (interaction.member as GuildMember).voice.channelId as string,
            textId: interaction.channelId,
            deaf: true,
        }) as KazagumoPlayer

        const query = options.getString("query") as string;

        const res = await player.search(query, {
            requester: interaction.user
        }) as KazagumoSearchResult;

        if (!res.tracks.length) {
            if (player) player.destroy();
            await interaction.editReply({
                embeds: [embed.setDescription("No result found.").setTimestamp(),],
            });

            return;
        }

        if (res.type === "PLAYLIST") {
            const tracks = res.tracks;

            for (let i = 0; i < tracks.length; i++) {
                player.queue.add(tracks[i]);
            }

            if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) {
                player.play();

                embed.setAuthor({name: "Playlist add to queue", iconURL: (member as GuildMember).user.avatarURL() as string});
                embed.setDescription(`**[${res.playlistName}](${query})**`)
                embed.addFields(
                    {
                        name: "Added",
                        value: `\`${res.tracks.length}\` tracks`,
                        inline: true,
                    },
                    {
                        name: "Queued by",
                        value: `${member}`,
                        inline: true,
                    }
                )
                embed.setThumbnail(res.tracks[0].thumbnail as string);
                interaction.editReply({ embeds: [embed] });
                return;
            }
        }

        if (res.type == "TRACK" || res.type == "SEARCH") {
            player.queue.add(res.tracks[0]);

            if (!player.playing && !player.paused && !player.queue.size) {
                player.play();
            }

            embed.setAuthor({name: "Added to queue", iconURL: (member as GuildMember).user.avatarURL() as string});
            embed.setDescription(`**[${res.tracks[0].title}](${res.tracks[0].uri})**`)
            embed.addFields(
                {
                    name: "Queued by",
                    value: `${member}`,
                    inline: true,
                },
                {
                    name: "Duration",
                    value: `${pms(res.tracks[0].length as number)}`,
                    inline: true,
                }
            )
            embed.setThumbnail(res.tracks[0].thumbnail as string);

            await interaction.editReply({ embeds: [embed] });

            if (player.queue.size > 1) {
                embed.addFields({
                    name: "Position in queue",
                    value: `#${player.queue.size}`,
                    inline: true,
                })
            }

            await interaction.editReply({ embeds: [embed] });
            return;
        }
    }

    private async checkVoice(interaction: ChatInputCommandInteraction): Promise<boolean> {

        if (!interaction.member || !interaction.guild) {
            await interaction.editReply({
                content: "You need to be in a guild to use this command",
            });

            return false;
        }

        const vc = (interaction.member as GuildMember).voice.channel;

        if (!vc) {
            await interaction.editReply({
                content: "You need to be in a voice channel to use this command",
            });

            return false;
        }

        if ((interaction.guild.members.me as GuildMember).voice.channelId && vc.id !== (interaction.guild.members.me as GuildMember).voice.channelId) {
            await interaction.editReply({
                content: "You need to be in the same voice channel as me to use this command",
            });

            return false;
        }

        return true;
    }
}
