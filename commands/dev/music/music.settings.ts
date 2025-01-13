import { EmbedBuilder, GuildMember, type ChatInputCommandInteraction } from "discord.js";
import type CustomClient from "../../../classes/CustomClient";
import SubCommand from "../../../classes/SubCommand";
import { PlayerManager } from "../../../classes/PlayerManager";
import pms from 'pretty-ms';
import type { KazagumoTrack } from "kazagumo";
import embedPages from "../../../utils/embedPages";


type MusicSettingOptions = "queue" | "queueclear" | "skip" | "pause" | "resume" | "stop" | "lyrics" | "shuffle" | "nowplaying";

export default class MusicSettings extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "musicdev.settings",
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const { options, member, guild } = interaction;

        let embed = new EmbedBuilder().setColor("Blurple").setTimestamp();

        let embeds: EmbedBuilder[] = [];

        const setting = options.getString("options") as MusicSettingOptions;

        await interaction.deferReply();

        if (!guild) return;

        const player = this.client.kazagumo.shoukaku.players.get(guild.id);

        if (!player) {
            await interaction.editReply({ embeds: [embed.setDescription("There is no music playing right now.")] });
            return;
        }

        const playerManager = new PlayerManager(player, this.client);

        const track = player.queue.current as KazagumoTrack;

        switch(setting) {
            case "stop":
                if (playerManager.isSongPlaying(interaction)) {
                    await interaction.editReply({ embeds: [embed.setDescription("Music player has been stopped.")] });
                    player.destroy();
                    return;
                }
                await interaction.editReply({ embeds: [embed.setDescription("Music player is already stopped.")] });
                return;

            case "pause":
                if (playerManager.isSongPlaying(interaction)) {
                    await interaction.editReply({ embeds: [embed.setDescription("Music player has been paused.")] });
                    player.pause(true);
                    return;
                }
                await interaction.editReply({ embeds: [embed.setDescription("Music player is already paused.")] });
                return;

            case "resume":
                if (!playerManager.isSongPlaying(interaction)) {
                    await interaction.editReply({ embeds: [embed.setDescription("Music player has been resumed.")] });
                    player.pause(false);
                    return;
                }
                await interaction.editReply({ embeds: [embed.setDescription("Music player is already playing.")] });
                return;

            case "skip":
                if (!playerManager.isSongPlaying(interaction) && !playerManager.checkForQueue(interaction)) {
                    await interaction.editReply({ embeds: [embed.setDescription("Music player has been skipped.")] });
                    player.skip();
                    return;
                }
                await interaction.editReply({ embeds: [embed.setDescription("There is no next music to skip to.")] });
                return;

            case "nowplaying":
                if (playerManager.isSongPlaying(interaction)) {
                    if (!member || !track.length) return;
                    await interaction.editReply({ embeds: [embed.setAuthor({name: "Now Playing", iconURL: (member as GuildMember).user.avatarURL() as string}).setDescription(`**[${track.title}](${track.uri})** [${track.requester}]
                        \`${pms(player.shoukaku.position)}\` ${playerManager.getProgressbar()} \`${pms(track.length as number)}\``)] });
                    return;
                }
                await interaction.editReply({ embeds: [embed.setDescription("There is no music playing right now.")] });
                return;

            case "shuffle":
                if (!playerManager.isSongPlaying(interaction)) {
                    await interaction.editReply({ embeds: [embed.setDescription("There is no music playing right now.")] });
                    return;
                }

                if (!playerManager.checkForQueue(interaction)) {
                    await interaction.editReply({ embeds: [embed.setDescription("There is no music in the queue right now.")] });
                    return;
                }

                await interaction.editReply({ embeds: [embed.setDescription("Queue has been shuffled.")] });
                player.queue.shuffle();
                return;

            case "queueclear":
                if (!playerManager.isSongPlaying(interaction)) {
                    await interaction.editReply({ embeds: [embed.setDescription("There is no music playing right now.")] });
                    return;
                }

                if (!playerManager.checkForQueue(interaction)) {
                    await interaction.editReply({ embeds: [embed.setDescription("There is no music in the queue right now.")] });
                    return;
                }

                await interaction.editReply({ embeds: [embed.setDescription("Queue has been cleared.")] });
                player.queue.clear();
                return;

            case "queue":
                if (!playerManager.isSongPlaying(interaction)) {
                    await interaction.editReply({ embeds: [embed.setDescription("There is no music playing right now.")] });
                    return;
                }

                if (playerManager.checkForQueue(interaction)) {
                    if (!player.queue.current) return;

                    console.log(player.queue.length);

                    const songs = player.queue.map((song, index) => {
                        return `${index + 1}. [${song.title}](${song.uri}) [${song.requester}]`;
                    });

                    for (let i = 0; i < songs.length; i += 10) {
                        let embed = new EmbedBuilder().setColor("Blurple").setTimestamp();
                        embed.setAuthor({ name: `Current queue for ${guild.name}` });
                        embed.setTitle(`▶️ | Currently playing: ${player.queue.current.title}`);
                        embed.setDescription(songs.slice(i, i + 10).join("\n"));

                        embeds.push(embed);
                    }
                    await embedPages(interaction, embeds);
                    return;
                }

                await interaction.editReply({ embeds: [embed.setDescription("There is no music in the queue right now.")] });
                return;

            case "lyrics":
                await interaction.editReply({ embeds: [embed.setDescription("This feature is not available yet.")] });
                return;
        }
    }
}
