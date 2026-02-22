import SubCommand from "../../../classes/SubCommand";
import { ChatInputCommandInteraction } from "discord.js";
import type CustomClient from "../../../classes/CustomClient";
import type { KazagumoPlayer } from "kazagumo";
import { PlayerManager } from "../../../classes/PlayerManager";

export default class MusicRepeat extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "music.repeat",
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const { options, member, guild } = interaction;

        await interaction.deferReply();

        const player = this.client.kazagumo.shoukaku.players.get(guild!.id) as KazagumoPlayer;
        const type = options.getString("type") as "track" | "queue" | "none";

        const playerManager = new PlayerManager(player, this.client);

        await playerManager.setRepeatMode(interaction, type);
    }
}
