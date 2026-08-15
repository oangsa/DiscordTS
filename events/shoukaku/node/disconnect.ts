import ShoukakuEvent from "../../../classes/ShoukakuEvent";
import { Chalk } from "chalk";

export default class shoukakuDisconnect extends ShoukakuEvent {
    constructor() {
        super("disconnect");
    }

    public Execute(name: string, count: number): void {
        const { magenta, white, red } = new Chalk();

        console.log(
            magenta("[") +
            magenta("Shoukaku") +
            magenta("] ") +
            white(`Lost connection to node`) +
            red(` ${name}.`) +
            white(` ${count} player(s) moved.`)
        );
    }
}
