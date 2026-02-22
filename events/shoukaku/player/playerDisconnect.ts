import type { KazagumoPlayer } from "kazagumo";
import ShoukakuEvent from "../../../classes/ShoukakuEvent";
import type CustomClient from "../../../classes/CustomClient";

export default class PlayerStart extends ShoukakuEvent {
    client: CustomClient;

    constructor(client: CustomClient) {
        super("playerDisconnect");

        this.client = client;
    }

    public async Execute(player: KazagumoPlayer): Promise<void> {
        player.destroy();
    }
}
