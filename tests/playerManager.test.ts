import { describe, expect, mock, test } from "bun:test";
import { PlayerManager } from "../classes/PlayerManager";
import type CustomClient from "../classes/CustomClient";

const createPlayer = (overrides: object = {}) => ({
    data: new Map<string, any>(),
    loop: "none",
    paused: false,
    queue: {
        current: {
            length: 240000,
            requester: { id: "user" },
            thumbnail: "https://example.com/thumb.png",
            title: "Song",
            uri: "https://example.com/song",
        },
        size: 0,
    },
    shoukaku: { position: 60000 },
    textId: "text-channel",
    voiceId: "voice-channel",
    volume: 50,
    ...overrides,
});

const createClient = (send: ReturnType<typeof mock>) => ({
    channels: { cache: new Map([["text-channel", { send }]]) },
}) as unknown as CustomClient;

describe("now playing message", () => {
    test("posts the controls and keeps refreshing the progress", async () => {
        const edit = mock(async (_options: any) => ({}));
        const send = mock(async (_options: any) => ({ edit, embeds: [{ data: {} }] }));
        const player = createPlayer();
        const playerManager = new PlayerManager(player as any, createClient(send));

        await playerManager.startNowPlaying();

        expect(send).toHaveBeenCalledTimes(1);
        expect(send.mock.calls[0][0].components).toHaveLength(2);
        expect(player.data.get("nowPlayingInterval")).toBeDefined();

        player.shoukaku.position = 120000;
        await playerManager.refreshNowPlaying();

        expect(edit).toHaveBeenCalledTimes(1);
        expect(edit.mock.calls[0][0].embeds[0].data.description).toContain("2:00");

        await playerManager.endNowPlaying();
    });

    test("marks the message done and drops the controls when the track ends", async () => {
        const edit = mock(async (_options: any) => ({}));
        const send = mock(async (_options: any) => ({ edit, embeds: [{ data: { title: "🎧 Now Playing" } }] }));
        const player = createPlayer();
        const playerManager = new PlayerManager(player as any, createClient(send));

        await playerManager.startNowPlaying();
        await playerManager.endNowPlaying();

        expect(edit).toHaveBeenCalledTimes(1);
        expect(edit.mock.calls[0][0].embeds[0].data.title).toBe("✅ Finished Playing");
        expect(edit.mock.calls[0][0].components).toEqual([]);
        expect(player.data.has("nowPlayingMessage")).toBe(false);
        expect(player.data.has("nowPlayingInterval")).toBe(false);
    });

    test("refuses a button press from outside the player voice channel", async () => {
        const reply = mock(async () => ({}));
        const client = { kazagumo: { shoukaku: { players: new Map([["guild", createPlayer()]]) } } };
        const interaction = { guildId: "guild", member: { voice: { channelId: "other-channel" } }, reply };

        const playerManager = await PlayerManager.fromButton(interaction as any, client as any);

        expect(playerManager).toBeNull();
        expect(reply).toHaveBeenCalledWith({
            content: "You need to be in the same voice channel as me to use this button.",
            flags: "Ephemeral",
        });
    });
});
