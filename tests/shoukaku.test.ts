import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { Connector } from "shoukaku";
import CustomKazagumo from "../classes/CustomShoukaku";
import type CustomClient from "../classes/CustomClient";
import ShoukakuDisconnect from "../events/shoukaku/node/disconnect";
import ShoukakuReady from "../events/shoukaku/node/ready";

class TestConnector extends Connector {
    public getId(): string {
        return "test";
    }

    public sendPacket(): void {}

    public listen(): void {}
}

afterEach(() => {
    mock.restore();
});

describe("Shoukaku event integration", () => {
    test("loads node events on Shoukaku and player events on Kazagumo", async () => {
        spyOn(console, "log").mockImplementation(() => {});
        const client = {} as CustomClient;
        const kazagumo = new CustomKazagumo(
            client,
            new TestConnector({}),
            { defaultSearchEngine: "youtube", send: () => {} },
        );

        await kazagumo.loadNodes();
        await kazagumo.loadPlayers();

        expect(kazagumo.shoukaku.shoukaku.listenerCount("ready")).toBe(1);
        expect(kazagumo.shoukaku.shoukaku.listenerCount("disconnect")).toBe(1);
        expect(kazagumo.shoukaku.listenerCount("playerStart")).toBe(1);
        expect(kazagumo.shoukaku.listenerCount("playerDestroy")).toBe(1);
        expect(kazagumo.shoukaku.listenerCount("playerDisconnect")).toBe(0);
    });

    test("accepts Shoukaku 4.3 lifecycle payloads", () => {
        const log = spyOn(console, "log").mockImplementation(() => {});

        new ShoukakuReady().Execute("main", false, false);
        new ShoukakuDisconnect().Execute("main", 0);

        expect(log).toHaveBeenCalledTimes(2);
        expect(log.mock.calls[0]?.[0]).toContain("main");
        expect(log.mock.calls[1]?.[0]).toContain("0 player(s) moved");
    });
});
