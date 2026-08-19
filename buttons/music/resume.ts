import { ButtonInteraction } from "discord.js";
import Button from "../../classes/Button";
import type CustomClient from "../../classes/CustomClient";
import { PlayerManager } from "../../classes/PlayerManager";

export default class MusicResume extends Button {
    constructor(client: CustomClient) {
        super(client, {
            customId: "music_resume",
        });
    }

    public async Execute(interaction: ButtonInteraction): Promise<void> {
        const playerManager = await PlayerManager.fromButton(interaction, this.client);

        if (!playerManager) return;

        playerManager.player.pause(false);

        await interaction.deferUpdate();
        await playerManager.refreshNowPlaying();
    }
}
