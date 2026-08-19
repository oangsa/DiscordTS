import { ButtonInteraction } from "discord.js";
import Button from "../../classes/Button";
import type CustomClient from "../../classes/CustomClient";
import { PlayerManager } from "../../classes/PlayerManager";

export default class MusicStop extends Button {
    constructor(client: CustomClient) {
        super(client, {
            customId: "music_stop",
        });
    }

    public async Execute(interaction: ButtonInteraction): Promise<void> {
        const playerManager = await PlayerManager.fromButton(interaction, this.client);

        if (!playerManager) return;

        await interaction.deferUpdate();

        // playerDestroy marks the now playing message as done.
        await playerManager.player.destroy();
    }
}
