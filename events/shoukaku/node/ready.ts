import { Events } from "discord.js";
import ShoukakuEvent from "../../../classes/ShoukakuEvent";
import { Node } from "shoukaku";
import { Chalk } from "chalk";

export default class shoukakuReady extends ShoukakuEvent {
    constructor() {
        super("ready");
    }

    public Execute(node: Node): void {
        const { magenta, white, green } = new Chalk();

        console.log(
            magenta("[") +
              magenta("Shoukaku") +
              magenta("]") +
              green(" Node ") +
              white(node.name) +
              green(" connected!")
          );
    }
}
