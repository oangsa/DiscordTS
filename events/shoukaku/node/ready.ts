import ShoukakuEvent from "../../../classes/ShoukakuEvent";
import { Chalk } from "chalk";

export default class shoukakuReady extends ShoukakuEvent {
    constructor() {
        super("ready");
    }

    public Execute(name: string, _lavalinkResume: boolean, _libraryResume: boolean): void {
        const { magenta, white, green } = new Chalk();

        console.log(
            magenta("[") +
              magenta("Shoukaku") +
              magenta("]") +
              green(" Node ") +
              white(name) +
              green(" connected!")
          );
    }
}
