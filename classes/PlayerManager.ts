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
}
