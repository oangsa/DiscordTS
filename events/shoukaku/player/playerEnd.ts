import type { KazagumoPlayer } from "kazagumo";
import ShoukakuEvent from "../../../classes/ShoukakuEvent";
import type CustomClient from "../../../classes/CustomClient";
import { PlayerManager } from "../../../classes/PlayerManager";

export default class PlayerEnd extends ShoukakuEvent {
    client: CustomClient;

    constructor(client: CustomClient) {
        super("playerEnd");

        this.client = client;
    }

    public async Execute(player: KazagumoPlayer): Promise<void> {
        await new PlayerManager(player, this.client).endNowPlaying();
    }
}
