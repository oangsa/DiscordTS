import ShoukakuEvent from "../../../classes/ShoukakuEvent";
import { Chalk } from "chalk";

export default class shoukakuDisconnect extends ShoukakuEvent {
    constructor() {
        super("disconnect");
    }

    public Execute(name: string, players: any[], moved: boolean): void {
        const { magenta, white, red } = new Chalk();

        if (moved) return;
        players.map((player) => player.connection.disconnect());

        console.log(
            magenta("[") +
            magenta("Shoukaku") +
            magenta("] ") +
            white(`Lost connection to node`) +
            red(` ${name}.`)
        );
    }
}
