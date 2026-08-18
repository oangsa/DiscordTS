import { describe, expect, mock, spyOn, test } from "bun:test";
import { KazagumoError } from "kazagumo";
import CommandInteraction from "../events/guild/commandInteraction";

describe("command interaction errors", () => {
    test("edits a deferred reply when no Lavalink node is available", async () => {
        const execute = mock(async () => {
            throw new KazagumoError(3, "No node found");
        });
        const editReply = mock(async () => ({}));
        const reply = mock(async () => ({}));
        const consoleError = spyOn(console, "error").mockImplementation(() => {});
        const client = {
            application: undefined,
            commands: new Map([["music", { name: "music", dev: false }]]),
            config: { devUserId: "developer" },
            cooldowns: new Map(),
            logger: { log: mock(() => {}) },
            subCommands: new Map([["music.play", { Execute: execute }]]),
        };
        const interaction = {
            commandName: "music",
            deferred: true,
            editReply,
            isCommand: () => true,
            options: {
                getSubcommand: () => "play",
                getSubcommandGroup: () => null,
            },
            replied: false,
            reply,
            user: { id: "user" },
        };

        await new CommandInteraction(client as any).Execute(interaction as any);

        expect(execute).toHaveBeenCalledTimes(1);
        expect(editReply).toHaveBeenCalledWith({
            content: "Music is temporarily unavailable because no audio servers are connected. Please try again in a moment.",
        });
        expect(reply).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledTimes(1);
        consoleError.mockRestore();
    });
});
