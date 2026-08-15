import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { REST, Routes } from "discord.js";
import type Command from "../classes/Command";
import type CustomClient from "../classes/CustomClient";
import Ready from "../events/client/Ready";

afterEach(() => {
    mock.restore();
});

function command(name: string, dev: boolean): Command {
    return {
        name,
        description: `${name} command`,
        options: [],
        defaultMemberPermissions: 0n,
        dmPermissions: false,
        dev,
    } as Command;
}

function client(developmentMode: boolean): CustomClient {
    return {
        developmentMode,
        user: { tag: "SomSriDev#2226" },
        logger: { log: mock(async () => {}) },
        config: {
            token: "production-token",
            discordClientId: "production-client",
            devToken: "development-token",
            devClientId: "development-client",
            devGuildId: "development-guild",
        },
        commands: new Map([
            ["welcome-leave", command("welcome-leave", false)],
            ["test", command("test", true)],
        ]),
    } as unknown as CustomClient;
}

describe("command registration", () => {
    test("development uses development credentials and publishes all commands locally", async () => {
        const setToken = spyOn(REST.prototype, "setToken");
        const put = spyOn(REST.prototype, "put").mockResolvedValue([] as never);
        spyOn(console, "log").mockImplementation(() => {});

        await new Ready(client(true)).Execute();

        expect(setToken).toHaveBeenCalledWith("development-token");
        expect(put).toHaveBeenCalledTimes(1);
        expect(put.mock.calls[0]?.[0]).toBe(
            Routes.applicationGuildCommands("development-client", "development-guild"),
        );
        const request = put.mock.calls[0]?.[1] as { body: Array<{ name: string }> };
        expect(request.body.map(item => item.name)).toEqual(["welcome-leave", "test"]);
    });

    test("production uses production credentials and excludes development commands", async () => {
        const setToken = spyOn(REST.prototype, "setToken");
        const put = spyOn(REST.prototype, "put").mockResolvedValue([] as never);
        spyOn(console, "log").mockImplementation(() => {});

        await new Ready(client(false)).Execute();

        expect(setToken).toHaveBeenCalledWith("production-token");
        expect(put).toHaveBeenCalledTimes(1);
        expect(put.mock.calls[0]?.[0]).toBe(Routes.applicationCommands("production-client"));
        const request = put.mock.calls[0]?.[1] as { body: Array<{ name: string }> };
        expect(request.body.map(item => item.name)).toEqual(["welcome-leave"]);
    });
});
