import type { ChatInputCommandInteraction } from "discord.js";
import type { KazagumoPlayer } from "kazagumo";
import type IPlayerManager from "../interfaces/IMusic";
import type CustomClient from "./CustomClient";
import { EmbedBuilder } from "discord.js";

export class PlayerManager implements IPlayerManager {
    player: KazagumoPlayer;
    client: CustomClient;
    embed: EmbedBuilder;

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
}
