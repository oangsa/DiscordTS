import type { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import ShoukakuEvent from "../../../classes/ShoukakuEvent";
import type CustomClient from "../../../classes/CustomClient";
import { PlayerManager } from "../../../classes/PlayerManager";

export default class PlayerStart extends ShoukakuEvent {
    client: CustomClient;

    constructor(client: CustomClient) {
        super("playerStart");

        this.client = client;
    }

    public async Execute(player: KazagumoPlayer, _track: KazagumoTrack): Promise<void> {
        await new PlayerManager(player, this.client).startNowPlaying();
    }
}
