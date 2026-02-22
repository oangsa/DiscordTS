import ShoukakuEvent from "../../../classes/ShoukakuEvent";
import type CustomClient from "../../../classes/CustomClient";
import { Chalk } from "chalk";


export default class PlayerStart extends ShoukakuEvent {
    client: CustomClient;

    constructor(client: CustomClient) {
        super("playerDestroy");

        this.client = client;
    }

    public Execute(): void {
        const { magenta, white } = new Chalk();

        console.log(
            magenta("[") +
              magenta("Shoukaku Player") +
              magenta("] ") +
              white(`Player destroyed.`)
          );
    }
}
