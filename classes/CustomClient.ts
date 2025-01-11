import { Client, GatewayIntentBits, Partials } from "discord.js";
import type ICustomClient from "../interfaces/ICustomClient";
import Handlers from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import { Connectors } from "shoukaku";
import CustomKazagumo from "./CustomShoukaku";
import Spotify from "kazagumo-spotify";

const { Guilds, GuildMembers, GuildMessages, GuildVoiceStates, MessageContent } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials

export default class CustomClient extends Client implements ICustomClient {

    config: {token: string, discordClientId: string, guildId: string};
    handler: Handlers;
    commands: Map<string, Command>;
    subCommands: Map<string, SubCommand>;
    cooldowns: Map<string, Map<string, number>>;
    kazagumo: CustomKazagumo;

    constructor() {
        super({ intents: [Guilds, GuildMembers, GuildMessages, GuildVoiceStates, MessageContent], partials: [User, Message, GuildMember, ThreadMember] });

        this.handler = new Handlers(this);
        this.commands = new Map();
        this.subCommands = new Map();
        this.cooldowns = new Map();

        this.config = {
            token: process.env.TOKEN as string,
            discordClientId: process.env.DISCORD_CLIENT_ID as string,
            guildId: process.env.GUILD_ID as string
        };

        this.kazagumo = new CustomKazagumo(this, new Connectors.DiscordJS(this), {
            plugins: [
                new Spotify({
                    clientId: process.env.spotifyClientID as string,
                    clientSecret: process.env.spotifySecret as string,
                  }),
            ],
            defaultSearchEngine: "youtube",
            send: (guildId, payload) => {
                const guild = this.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload)
            }
        },
        {
            moveOnDisconnect: false,
            resume: true,
            reconnectTries: 5,
            restTimeout: 10000,
        });
    };

    private async LoadHandlers(): Promise<void> {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
        this.kazagumo.loadNodes().catch(console.error);
        this.kazagumo.loadPlayers().catch(console.error);
    };


    public Start(): void {
        this.LoadHandlers();
        this.login(this.config.token);
    };
}
