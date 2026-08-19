import type { ChatInputCommandInteraction, Message } from "discord.js";
import type { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import type IPlayerManager from "../interfaces/IMusic";
import type CustomClient from "./CustomClient";
import { EmbedBuilder } from "discord.js";
import pms from "pretty-ms";

export class PlayerManager implements IPlayerManager {
    player: KazagumoPlayer;
    client: CustomClient;
    embed: EmbedBuilder;

    // ponytail: fixed 5s refresh, low enough to feel live without burning the channel edit rate limit.
    private static readonly REFRESH_INTERVAL = 5000;
    private static readonly MESSAGE_KEY = "nowPlayingMessage";
    private static readonly INTERVAL_KEY = "nowPlayingInterval";

    constructor(player: KazagumoPlayer, client: CustomClient) {
        this.player = player;
        this.client = client;

        this.embed = new EmbedBuilder().setColor("Blurple").setTimestamp();
    }

    // Functional methods
    public setRepeatMode(interaction: ChatInputCommandInteraction, mode: "track" | "queue" | "none"): void {
        if (!this.player) {
            interaction.editReply({
                embeds: [this.embed.setDescription("There is no music playing right now.")]
            })

            return
        }

        switch (mode) {
            case "track":
                this.player.setLoop(mode);
                interaction.editReply({
                    embeds: [this.embed.setDescription("Repeat mode is now on. (Single track)")]
                })
                break;

            case "queue":
                this.player.setLoop(mode);
                interaction.editReply({
                    embeds: [this.embed.setDescription("Repeat mode is now on. (Queue)")]
                })
                break;

            case "none":
                this.player.setLoop(mode);
                interaction.editReply({
                    embeds: [this.embed.setDescription("Repeat mode is now off.")]
                })
                break;

        }
    }

    public async setVolume(interaction: ChatInputCommandInteraction, volume: number): Promise<void> {
        if (!this.player) {
            interaction.editReply({
                embeds: [this.embed.setDescription("There is no music playing right now.")]
            })

            return;
        }

        if (volume < 0 || volume > 100) {
            interaction.editReply({
                embeds: [this.embed.setDescription("Volume must be between 0 and 100")]
            })

            return;
        }

        await this.player.setVolume(volume);

        interaction.editReply({
            embeds: [this.embed.setDescription(`Volume set to ${this.player.volume}%`)]
        })

        return;
    }

    // Now playing message lifecycle
    public async startNowPlaying(): Promise<void> {
        await this.endNowPlaying();

        if (!this.player.textId || !this.player.queue.current) return;

        const channel = this.client.channels.cache.get(this.player.textId);

        if (!channel || !('send' in channel)) return;

        const message = await channel.send({ embeds: [this.getNowPlayingEmbed()] });

        this.player.data.set(PlayerManager.MESSAGE_KEY, message);
        this.player.data.set(PlayerManager.INTERVAL_KEY, setInterval(() => this.refreshNowPlaying(), PlayerManager.REFRESH_INTERVAL));
    }

    public async refreshNowPlaying(): Promise<void> {
        const message: Message | undefined = this.player.data.get(PlayerManager.MESSAGE_KEY);

        if (!message || !this.player.queue.current) return;

        await message.edit({ embeds: [this.getNowPlayingEmbed()] }).catch(() => this.clearRefresh());
    }

    /** Mark the current now playing message as done and drop its controls before the next track takes over. */
    public async endNowPlaying(): Promise<void> {
        this.clearRefresh();

        const message: Message | undefined = this.player.data.get(PlayerManager.MESSAGE_KEY);

        if (!message) return;

        this.player.data.delete(PlayerManager.MESSAGE_KEY);

        await message.edit({
            embeds: [EmbedBuilder.from(message.embeds[0]).setTitle("✅ Finished Playing").setColor("Grey")],
        }).catch(() => {});
    }

    private clearRefresh(): void {
        const interval = this.player.data.get(PlayerManager.INTERVAL_KEY);

        if (!interval) return;

        clearInterval(interval);
        this.player.data.delete(PlayerManager.INTERVAL_KEY);
    }

    // Utility methods
    public isSongPlaying(interaction: ChatInputCommandInteraction): boolean {
        return !(!this.player || !this.player.playing);
    }

    public checkForQueue(interaction: ChatInputCommandInteraction): boolean {
        return !(!this.player || !this.player.queue.size);
    }

    // Getters
    public getProgressbar(): string {
        const size = 15;
        const line = "▬";
        const slider = "🔘";

        if(!this.player.queue.current) return `${slider}${line.repeat(size - 1)}]`;

        const current = this.player.queue.current.length !== 0 ? this.player.shoukaku.position : this.player.queue.current.length;
        const total = this.player.queue.current.length as number;
        const bar = current > total ? [line.repeat((size / 2) * 2), (current / total) * 100] : [ line.repeat(Math.round((size / 2) * (current / total))).replace(/.$/, slider) + line.repeat(size - Math.round(size * (current / total)) + 1), current / total];

        if (!String(bar).includes(slider)) return `${slider}${line.repeat(size - 1)}`;

        return bar[0].toString();
    }

    public getNowPlayingEmbed(): EmbedBuilder {
        const track = this.player.queue.current as KazagumoTrack;
        const length = track.length as number;

        return new EmbedBuilder()
            .setColor("Blurple")
            .setTitle(this.player.paused ? "⏸️ Paused" : "🎧 Now Playing")
            .setDescription(`**[${track.title}](${track.uri})**\n\`${pms(this.player.shoukaku.position, { colonNotation: true, secondsDecimalDigits: 0 })}\` ${this.getProgressbar()} \`${pms(length, { colonNotation: true, secondsDecimalDigits: 0 })}\``)
            .addFields(
                { name: "Queued by", value: `<@${(track.requester as { id: string }).id}>`, inline: true },
                { name: "Volume", value: `${this.player.volume}%`, inline: true },
                { name: "Loop", value: this.player.loop === "none" ? "Off" : this.player.loop === "track" ? "Track" : "Queue", inline: true },
            )
            .setThumbnail(track.thumbnail as string)
            .setTimestamp();
    }
}
