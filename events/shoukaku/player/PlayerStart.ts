import type { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import ShoukakuEvent from "../../../classes/ShoukakuEvent";
import type CustomClient from "../../../classes/CustomClient";
import { EmbedBuilder } from "discord.js";
import pms from "pretty-ms";

export default class PlayerStart extends ShoukakuEvent {
    client: CustomClient;

    constructor(client: CustomClient) {
        super("playerStart");

        this.client = client;
    }

    public async Execute(player: KazagumoPlayer, track: KazagumoTrack): Promise<void> {
        const nowPlaying = new EmbedBuilder()

        nowPlaying.setTitle("🎧 Started Playing")
        nowPlaying.setDescription(`**[${track.title}](${track.uri})**`)
        nowPlaying.addFields(
            {
                name: "Queued by",
                value: `<@${(track.requester as { id: string }).id}>`,
                inline: true,
            },
            { name: "Duration", value: pms(track.length as number), inline: true }
        )
        nowPlaying.setThumbnail(track.thumbnail as string)
        nowPlaying.setTimestamp()
        nowPlaying.setColor("Blurple")

        if (!player.textId) return;
        const channel = this.client.channels.cache.get(player.textId);

        if (!channel || !('send' in channel)) return;
        const message = await channel.send({ embeds: [nowPlaying] });

        setTimeout(() => message.delete(), track.length);
    }
}
