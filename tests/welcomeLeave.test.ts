import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { ChannelType, Events, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import CustomClient from "../classes/CustomClient";
import Handlers from "../classes/Handler";
import WelcomeLeave from "../commands/prod/welcomeLeave/welcome-leave";
import WelcomeLeaveRegister from "../commands/prod/welcomeLeave/welcome-leave.register";
import WelcomeLeaveRevoke from "../commands/prod/welcomeLeave/welcome-leave.revoke";
import GuildMemberAdd from "../events/guild/guildMemberAdd";
import GuildMemberRemove from "../events/guild/guildMemberRemove";

afterEach(() => {
    mock.restore();
});

describe("welcome/leave configuration", () => {
    test("defines guild-only register and revoke subcommands", () => {
        const command = new WelcomeLeave({} as CustomClient);
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
                welcomeLeaveConfig: { upsert: configUpsert },
            },
        } as unknown as CustomClient;

        await new WelcomeLeaveRegister(client).Execute(interaction as never);

        expect(guildUpsert).toHaveBeenCalledWith({
            where: { discordId: "guild-1" },
            update: { name: "Secret Hideout" },
            create: { discordId: "guild-1", name: "Secret Hideout" },
        });
        expect(configUpsert).toHaveBeenCalledWith({
            where: { guildId: "guild-object-id" },
            update: { channelId: "channel-1", registeredById: "admin-1" },
            create: {
                guildId: "guild-object-id",
                channelId: "channel-1",
                registeredById: "admin-1",
            },
        });
        expect(editReply).toHaveBeenCalledWith("Welcome and leave messages will be sent in <#channel-1>.");
    });

    test("revokes an existing configuration", async () => {
        const deleteMany = mock(async () => ({ count: 1 }));
        const editReply = mock(async () => ({}));
        const client = {
            prisma: {
                guild: { findUnique: mock(async () => ({ id: "guild-object-id" })) },
                welcomeLeaveConfig: { deleteMany },
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

        await new WelcomeLeaveRevoke(client).Execute(interaction as never);

        expect(deleteMany).toHaveBeenCalledWith({ where: { guildId: "guild-object-id" } });
        expect(editReply).toHaveBeenCalledWith("Welcome and leave messages have been disabled.");
    });

    test("reports when revoke has no configuration", async () => {
        const editReply = mock(async () => ({}));
        const client = {
            prisma: {
                guild: { findUnique: mock(async () => null) },
                welcomeLeaveConfig: { deleteMany: mock(async () => ({ count: 0 })) },
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

        await new WelcomeLeaveRevoke(client).Execute(interaction as never);

        expect(editReply).toHaveBeenCalledWith("Welcome and leave messages are not configured.");
    });

    test("rejects unauthorized registration before persistence", async () => {
        const guildUpsert = mock(async () => ({ id: "guild-object-id" }));
        const configUpsert = mock(async () => ({}));
        const editReply = mock(async () => ({}));
        const client = {
            prisma: {
                guild: { upsert: guildUpsert },
                welcomeLeaveConfig: { upsert: configUpsert },
            },
        } as unknown as CustomClient;
        const interaction = {
            memberPermissions: new PermissionsBitField(0n),
            deferReply: mock(async () => ({})),
            editReply,
            deferred: true,
            replied: false,
        };

        await new WelcomeLeaveRegister(client).Execute(interaction as never);

        expect(guildUpsert).not.toHaveBeenCalled();
        expect(configUpsert).not.toHaveBeenCalled();
        expect(editReply).toHaveBeenCalledWith("You need the Manage Server permission to use this command.");
    });

    test("rejects unauthorized revoke before persistence", async () => {
        const findUnique = mock(async () => ({ id: "guild-object-id" }));
        const deleteMany = mock(async () => ({ count: 1 }));
        const editReply = mock(async () => ({}));
        const client = {
            prisma: {
                guild: { findUnique },
                welcomeLeaveConfig: { deleteMany },
            },
        } as unknown as CustomClient;
        const interaction = {
            guildId: "guild-1",
            memberPermissions: new PermissionsBitField(0n),
            deferReply: mock(async () => ({})),
            editReply,
            deferred: true,
            replied: false,
        };

        await new WelcomeLeaveRevoke(client).Execute(interaction as never);

        expect(findUnique).not.toHaveBeenCalled();
        expect(deleteMany).not.toHaveBeenCalled();
        expect(editReply).toHaveBeenCalledWith("You need the Manage Server permission to use this command.");
    });
});

describe("welcome/leave events", () => {
    function setupMember(channelAvailable = true) {
        const send = mock(async (_payload: unknown) => ({}));
        const fetch = mock(async () => channelAvailable ? { type: ChannelType.GuildText, send } : null);
        const member = {
            id: "member-1",
            guild: {
                id: "guild-1",
                name: "Secret Hideout",
                channels: { fetch },
            },
            user: {
                tag: "member#0001",
                displayAvatarURL: () => "https://cdn.example/avatar.png",
            },
        };
        const client = {
            prisma: {
                guild: {
                    findUnique: mock(async () => ({
                        welcomeLeaveConfig: { channelId: "channel-1" },
                    })),
                },
            },
        } as unknown as CustomClient;

        return { client, member, send };
    }

    test("sends screenshot-like welcome content", async () => {
        const { client, member, send } = setupMember();

        await new GuildMemberAdd(client).Execute(member as never);

        const payload = send.mock.calls[0]?.[0] as any;
        const embed = payload.embeds[0].toJSON();
        expect(payload.content).toBe("<@member-1> Joined The Server!");
        expect(embed.title).toBe("Welcome To Secret Hideout");
        expect(embed.thumbnail?.url).toBe("https://cdn.example/avatar.png");
    });

    test("sends matching leave content", async () => {
        const { client, member, send } = setupMember();

        await new GuildMemberRemove(client).Execute(member as never);

        const payload = send.mock.calls[0]?.[0] as any;
        const embed = payload.embeds[0].toJSON();
        expect(payload.content).toBe("**member#0001** Left The Server!");
        expect(embed.title).toBe("Goodbye From Secret Hideout");
        expect(embed.thumbnail?.url).toBe("https://cdn.example/avatar.png");
    });

    test("logs a missing welcome channel", async () => {
        const error = spyOn(console, "error").mockImplementation(() => {});
        const { client, member, send } = setupMember(false);

        await new GuildMemberAdd(client).Execute(member as never);

        expect(send).not.toHaveBeenCalled();
        expect(error).toHaveBeenCalledWith(
            "Configured welcome/leave channel channel-1 is unavailable in guild guild-1.",
        );
    });

    test("logs a missing leave channel", async () => {
        const error = spyOn(console, "error").mockImplementation(() => {});
        const { client, member, send } = setupMember(false);

        await new GuildMemberRemove(client).Execute(member as never);

        expect(send).not.toHaveBeenCalled();
        expect(error).toHaveBeenCalledWith(
            "Configured welcome/leave channel channel-1 is unavailable in guild guild-1.",
        );
    });
});

describe("client startup", () => {
    test("Discord event loader excludes Shoukaku lifecycle events", async () => {
        const registered: string[] = [];
        const client = {
            on: mock((name: string) => { registered.push(name); }),
            once: mock((name: string) => { registered.push(name); }),
        } as unknown as CustomClient;
        const handler = Object.create(Handlers.prototype) as any;
        handler.client = client;

        await handler.LoadEvents();

        expect(registered).toContain(Events.ClientReady);
        expect(registered).toContain(Events.InteractionCreate);
        expect(registered).toContain(Events.GuildMemberAdd);
        expect(registered).toContain(Events.GuildMemberRemove);
        expect(registered).toContain(Events.VoiceStateUpdate);
        expect(registered).not.toContain("ready");
        expect(registered).not.toContain("disconnect");
        expect(registered).not.toContain("playerStart");
        expect(registered).not.toContain("playerDestroy");
    });

    test("command loader resolves after welcome/leave handlers are registered", async () => {
        const client = {
            commands: new Map(),
            subCommands: new Map(),
        } as unknown as CustomClient;
        const handler = Object.create(Handlers.prototype) as any;
        handler.client = client;

        await handler.LoadCommands();

        expect(client.commands.has("welcome-leave")).toBe(true);
        expect(client.subCommands.has("welcome-leave.register")).toBe(true);
        expect(client.subCommands.has("welcome-leave.revoke")).toBe(true);
        expect(client.commands.has("google")).toBe(false);
        expect(client.subCommands.has("google.login")).toBe(false);
        expect(client.commands.has("googledev")).toBe(true);
        expect(client.subCommands.has("googledev.login")).toBe(true);
    });

    test("loads commands and events before Discord login", async () => {
        const order: string[] = [];
        const client = Object.create(CustomClient.prototype) as any;
        client.prisma = { $connect: mock(async () => { order.push("database"); }) };
        client.handler = {
            LoadAntiCrash: mock(() => { order.push("anti-crash"); }),
            LoadEvents: mock(async () => { await Promise.resolve(); order.push("events"); }),
            LoadCommands: mock(async () => { await Promise.resolve(); order.push("commands"); }),
            LoadButtons: mock(async () => { await Promise.resolve(); order.push("buttons"); }),
        };
        client.kazagumo = {
            loadNodes: mock(async () => { await Promise.resolve(); order.push("nodes"); }),
            loadPlayers: mock(async () => { await Promise.resolve(); order.push("players"); }),
        };
        client.developmentMode = false;
        client.config = { token: "token" };
        client.login = mock(async () => { order.push("login"); return "token"; });

        await client.Start();

        const loginIndex = order.indexOf("login");
        expect(order[0]).toBe("database");
        expect(order.indexOf("events")).toBeLessThan(loginIndex);
        expect(order.indexOf("commands")).toBeLessThan(loginIndex);
        expect(order.indexOf("buttons")).toBeLessThan(loginIndex);
        expect(order.indexOf("nodes")).toBeLessThan(loginIndex);
        expect(order.indexOf("players")).toBeLessThan(loginIndex);
    });
});
