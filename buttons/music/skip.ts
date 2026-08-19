import { ButtonInteraction } from "discord.js";
import Button from "../../classes/Button";
import type CustomClient from "../../classes/CustomClient";
import { PlayerManager } from "../../classes/PlayerManager";

export default class MusicSkip extends Button {
    constructor(client: CustomClient) {
        super(client, {
            customId: "music_skip",
        });
    }

    public async Execute(interaction: ButtonInteraction): Promise<void> {
        const playerManager = await PlayerManager.fromButton(interaction, this.client);

        if (!playerManager) return;

        await interaction.deferUpdate();

        // playerEnd marks the current message as done, playerStart posts the next one.
        playerManager.player.skip();
    }
}
