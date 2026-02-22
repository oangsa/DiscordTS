import { Connector, Shoukaku, type NodeOption, type ShoukakuOptions } from "shoukaku";
import type ICustomKazagumo from "../interfaces/ICustomShoukaku";
import { Kazagumo, type KazagumoOptions } from "kazagumo";
import type CustomClient from "./CustomClient";
import fileLoader from "../utils/fileLoader";
import { Chalk } from "chalk";

export default class CustomKazagumo implements ICustomKazagumo {
    client: CustomClient;
    shoukaku: Kazagumo;
    config: {nodes: NodeOption[]} = require("../lavalinkNodes.json");

    constructor(client: CustomClient, connector: Connector, plugins: KazagumoOptions, options?: ShoukakuOptions) {
        this.client = client;
        this.shoukaku = new Kazagumo(plugins, connector, this.config.nodes, options);

        // Attach fallback error handlers to prevent unhandled error crashes
        this.shoukaku.shoukaku.on("error", (name, error) => {
            console.error(`[Shoukaku] Error on node ${name}:`, error);
        });

        this.shoukaku.on("error", (_name, error) => {
            console.error(`[Kazagumo] Error:`, error);
        });
    }

    public async loadNodes(): Promise<void> {
        const { magenta, green } = new Chalk();
        const files = await fileLoader("shoukaku/node");

        files.forEach(async (file) => {
            const event = new (await import(file)).default(this.client);

            const execute = (...args: any) => event.Execute(...args);

            this.client.kazagumo.shoukaku.on(event.name, execute);

            return console.log(
              magenta("[") +
                magenta("Shoukaku") +
                magenta("]") +
                " Loaded " +
                green(`${event.name}.ts`)
            );
        });
    }

    public async loadPlayers(): Promise<void> {
        const { magenta, green } = new Chalk();

        const files = await fileLoader("shoukaku/player");

        files.forEach(async (file) => {
            const event = new (await import(file)).default(this.client);
            const execute = (...args: any) => event.Execute(...args, this.client);

            this.client.kazagumo.shoukaku.on(event.name, execute);

            return console.log(
              magenta("[") +
                magenta("Shoukaku Player") +
                magenta("]") +
                " Loaded " +
                green(`${event.name}.ts`)
            );
        });
    }
}
