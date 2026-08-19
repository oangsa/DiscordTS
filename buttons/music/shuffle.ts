import { ButtonInteraction } from "discord.js";
import Button from "../../classes/Button";
import type CustomClient from "../../classes/CustomClient";
import { PlayerManager } from "../../classes/PlayerManager";

export default class MusicShuffle extends Button {
    constructor(client: CustomClient) {
        super(client, {
            customId: "music_shuffle",
        });
    }

    public async Execute(interaction: ButtonInteraction): Promise<void> {
        const playerManager = await PlayerManager.fromButton(interaction, this.client);

        if (!playerManager) return;

        if (!playerManager.player.queue.size) {
            await interaction.reply({ content: "There is no music in the queue right now.", flags: "Ephemeral" });
            return;
        }

        playerManager.player.queue.shuffle();

        await interaction.reply({ content: "Queue has been shuffled.", flags: "Ephemeral" });
    }
}
