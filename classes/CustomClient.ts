import { Client, GatewayIntentBits, Partials } from "discord.js";
import type ICustomClient from "../interfaces/ICustomClient";
import Handlers from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import { Connectors } from "shoukaku";
import CustomKazagumo from "./CustomShoukaku";
import Spotify from "kazagumo-spotify";
import type IConfig from "../interfaces/IConfig";

const { Guilds, GuildMembers, GuildMessages, GuildVoiceStates, MessageContent } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials

export default class CustomClient extends Client implements ICustomClient {

    config: IConfig;
    handler: Handlers;
    commands: Map<string, Command>;
    subCommands: Map<string, SubCommand>;
    cooldowns: Map<string, Map<string, number>>;
    kazagumo: CustomKazagumo;
    developmentMode: boolean;

    constructor(devMode: boolean | undefined) {
        super({ intents: [Guilds, GuildMembers, GuildMessages, GuildVoiceStates, MessageContent], partials: [User, Message, GuildMember, ThreadMember] });

        this.handler = new Handlers(this);
        this.commands = new Map();
        this.subCommands = new Map();
        this.cooldowns = new Map();

        this.developmentMode = devMode ? devMode : false;

        this.config = {
            token: process.env.TOKEN as string,
            discordClientId: process.env.DISCORD_CLIENT_ID as string,

            // Development Variables
            devGuildId: process.env.DEV_GUILD_ID as string,
            devClientId: process.env.DEV_DISCORD_CLIENT_ID as string,
            devToken: process.env.DEV_TOKEN as string,
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
        this.handler.LoadAntiCrash();
        this.kazagumo.loadNodes()
        this.kazagumo.loadPlayers()

    };


    public Start(): void {
        this.LoadHandlers();
        this.login(this.developmentMode ? this.config.devToken : this.config.token);
    };
}
