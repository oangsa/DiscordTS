import ShoukakuEvent from "../../../classes/ShoukakuEvent";
import { Chalk } from "chalk";

export default class shoukakuError extends ShoukakuEvent {
    constructor() {
        super("error");
    }

    public Execute(name: string, error: any): void {
        const { magenta, white, red } = new Chalk();

        console.log(
            magenta("[") +
              magenta("Shoukaku") +
              magenta("] ") +
              red("An error has occured regarding node ") +
              white(name) +
              red(`: ${error}.`)
          );
    }
}
