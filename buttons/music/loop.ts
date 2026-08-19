import { ButtonInteraction } from "discord.js";
import Button from "../../classes/Button";
import type CustomClient from "../../classes/CustomClient";
import { PlayerManager } from "../../classes/PlayerManager";

const NEXT_MODE = { none: "track", track: "queue", queue: "none" } as const;

export default class MusicLoop extends Button {
    constructor(client: CustomClient) {
        super(client, {
            customId: "music_loop",
        });
    }

    public async Execute(interaction: ButtonInteraction): Promise<void> {
        const playerManager = await PlayerManager.fromButton(interaction, this.client);

        if (!playerManager) return;

        playerManager.player.setLoop(NEXT_MODE[playerManager.player.loop]);

        await interaction.deferUpdate();
        await playerManager.refreshNowPlaying();
    }
}
