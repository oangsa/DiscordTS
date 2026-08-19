import { describe, expect, mock, spyOn, test } from "bun:test";
import ButtonInteractionEvent from "../events/guild/buttonInteraction";
import Handlers from "../classes/Handler";
import type CustomClient from "../classes/CustomClient";

const buttonInteraction = (customId: string, overrides: object = {}) => ({
    customId,
    deferred: false,
    isButton: () => true,
    replied: false,
    ...overrides,
});

describe("button handler", () => {
    test("loads every music button by its custom id", async () => {
        const client = { buttons: new Map() } as unknown as CustomClient;
        const handler = Object.create(Handlers.prototype) as any;
        handler.client = client;

        await handler.LoadButtons();

        for (const customId of ["music_pause", "music_resume", "music_skip", "music_loop", "music_shuffle", "music_stop"]) {
            expect(client.buttons.has(customId)).toBe(true);
        }
    });

    test("dispatches a press to the matching button", async () => {
        const Execute = mock(async () => {});
        const client = { buttons: new Map([["music_pause", { Execute }]]) };

        await new ButtonInteractionEvent(client as any).Execute(buttonInteraction("music_pause") as any);

        expect(Execute).toHaveBeenCalledTimes(1);
    });

    test("ignores custom ids owned by a message component collector", async () => {
        const reply = mock(async () => ({}));
        const client = { buttons: new Map() };

        await new ButtonInteractionEvent(client as any).Execute(buttonInteraction("next_embed", { reply }) as any);

        expect(reply).not.toHaveBeenCalled();
    });

    test("replies once when a button throws", async () => {
        const Execute = mock(async () => { throw new Error("boom"); });
        const reply = mock(async () => ({}));
        const consoleError = spyOn(console, "error").mockImplementation(() => {});
        const client = { buttons: new Map([["music_stop", { Execute }]]) };

        await new ButtonInteractionEvent(client as any).Execute(buttonInteraction("music_stop", { reply }) as any);

        expect(reply).toHaveBeenCalledWith({
            content: "Something went wrong while running this button. Please try again.",
            flags: "Ephemeral",
        });
        consoleError.mockRestore();
    });
});
