import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { ChannelType, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import type CustomClient from "../classes/CustomClient";
import YearProgress from "../commands/prod/yearProgress/year-progress";
import YearProgressRegister from "../commands/prod/yearProgress/year-progress.register";
import YearProgressRevoke from "../commands/prod/yearProgress/year-progress.revoke";
import {
    buildYearProgressMessage,
    nextYearProgressRun,
    sendYearProgress,
} from "../utils/yearProgress";

afterEach(() => {
    mock.restore();
});

describe("year progress configuration", () => {
    test("defines guild-only register and revoke subcommands", () => {
        const command = new YearProgress({} as CustomClient);
        const options = command.options as Array<{
            name: string;
            options?: Array<{ name: string; required?: boolean; channel_types?: ChannelType[] }>;
        }>;

        expect(command.defaultMemberPermissions).toBe(PermissionsBitField.Flags.ManageGuild);
        expect(command.dmPermissions).toBe(false);
        expect(options.map(option => option.name)).toEqual(["register", "revoke"]);
        expect(options[0]?.options?.[0]).toEqual(expect.objectContaining({
            name: "channel_id",
            required: true,
            channel_types: [ChannelType.GuildText],
        }));
    });

    test("registers one channel for the guild", async () => {
        const guildUpsert = mock(async () => ({ id: "guild-object-id" }));
        const configUpsert = mock(async () => ({}));
        const editReply = mock(async () => ({}));
        const channel = {
            id: "channel-1",
            type: ChannelType.GuildText,
            permissionsFor: () => ({ has: () => true }),
            toString: () => "<#channel-1>",
        };
        const interaction = {
            guild: { id: "guild-1", name: "Secret Hideout", members: { me: {} } },
            memberPermissions: new PermissionsBitField(PermissionFlagsBits.ManageGuild),
            options: { getChannel: () => channel },
            user: { id: "admin-1" },
            deferReply: mock(async () => ({})),
            editReply,
            deferred: true,
            replied: false,
        };
        const client = {
            prisma: {
                guild: { upsert: guildUpsert },
                yearProgressConfig: { upsert: configUpsert },
            },
        } as unknown as CustomClient;

        await new YearProgressRegister(client).Execute(interaction as never);

        expect(configUpsert).toHaveBeenCalledWith({
            where: { guildId: "guild-object-id" },
            update: { channelId: "channel-1", registeredById: "admin-1" },
            create: {
                guildId: "guild-object-id",
                channelId: "channel-1",
                registeredById: "admin-1",
            },
        });
        expect(editReply).toHaveBeenCalledWith("Year progress updates will be sent in <#channel-1>.");
    });

    test("revokes an existing configuration", async () => {
        const deleteMany = mock(async () => ({ count: 1 }));
        const editReply = mock(async () => ({}));
        const client = {
            prisma: {
                guild: { findUnique: mock(async () => ({ id: "guild-object-id" })) },
                yearProgressConfig: { deleteMany },
            },
        } as unknown as CustomClient;
        const interaction = {
            guildId: "guild-1",
            memberPermissions: new PermissionsBitField(PermissionFlagsBits.ManageGuild),
            deferReply: mock(async () => ({})),
            editReply,
            deferred: true,
            replied: false,
        };

        await new YearProgressRevoke(client).Execute(interaction as never);

        expect(deleteMany).toHaveBeenCalledWith({ where: { guildId: "guild-object-id" } });
        expect(editReply).toHaveBeenCalledWith("Year progress updates have been disabled.");
    });
});

describe("year progress schedule", () => {
    test("runs at midnight UTC on the next first or fifteenth", () => {
        expect(nextYearProgressRun(new Date("2026-08-10T12:00:00Z")).toISOString())
            .toBe("2026-08-15T00:00:00.000Z");
        expect(nextYearProgressRun(new Date("2026-08-16T12:00:00Z")).toISOString())
            .toBe("2026-09-01T00:00:00.000Z");
    });

    test("broadcasts to every registered guild when one guild fails", async () => {
        const send = mock(async () => ({}));
        const error = spyOn(console, "error").mockImplementation(() => {});
        const workingGuild = {
            channels: {
                fetch: mock(async () => ({ type: ChannelType.GuildText, send })),
            },
        };
        const client = {
            prisma: {
                yearProgressConfig: {
                    findMany: mock(async () => [
                        { channelId: "missing-channel", guild: { discordId: "missing-guild" } },
                        { channelId: "channel-2", guild: { discordId: "guild-2" } },
                    ]),
                },
            },
            guilds: {
                cache: new Map([["guild-2", workingGuild]]),
                fetch: mock(async () => { throw new Error("Unknown Guild"); }),
            },
        } as unknown as CustomClient;
        const now = new Date("2026-07-01T00:00:00Z");

        await sendYearProgress(client, now);

        expect(send).toHaveBeenCalledWith({
            content: buildYearProgressMessage(now),
            allowedMentions: { parse: ["everyone"] },
        });
        expect(error).toHaveBeenCalledTimes(1);
    });
});
