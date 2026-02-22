import { Events, REST, Routes } from "discord.js";
import CustomClient from "../../classes/CustomClient";
import Event from "../../classes/Event";
import Command from "../../classes/Command";

interface CommandJSON {
    name: string;
    description: string;
    options: object;
    default_member_permissions: string;
    dm_permission: string;
}

export default class Ready extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.ClientReady,
            description: 'Event that fires when the client is ready',
            isOnce: true,
            client: client
        });
    }

    public async Execute(): Promise<void> {
        console.log(`Logged in as ${this.client.user?.tag} in ${this.client.developmentMode ? 'development' : 'production'} mode!`);
        this.client.logger.log(`Logged in as ${this.client.user?.tag} in ${this.client.developmentMode ? 'development' : 'production'} mode!`);

        const clientId = this.client.developmentMode ? this.client.config.devClientId : this.client.config.discordClientId;
        const rest = new REST().setToken(this.client.config.devToken);

        if(!this.client.developmentMode) {
            const globalCommands: any = await rest.put(Routes.applicationCommands(clientId), {
                body: this.getJSON(this.client.commands, "global")
            })

            console.log(`Successfully set ${globalCommands.length} global commands!`);
        }

        if (!this.client.developmentMode && this.client.config.devToken != this.client.config.token) return;
        const localCommands: any = await rest.put(Routes.applicationGuildCommands(this.client.config.devClientId, this.client.config.devGuildId), {
            body: this.getJSON(this.client.commands, "client")
        });

        console.log(`Successfully set ${localCommands.length} development commands!`)
    }

    private getJSON(commands: Map<string, Command>, mode: "global" | "client"): CommandJSON[] {
        const json: CommandJSON[] = [];

        commands.forEach((cmd: Command) => {
            if (mode === "global" && cmd.dev) return;
            if (mode === "client" && !cmd.dev) return;

            json.push({
                name: cmd.name,
                description: cmd.description,
                options: cmd.options,
                default_member_permissions: cmd.defaultMemberPermissions.toString(),
                dm_permission: cmd.dmPermissions.toString()
            });
        });

        return json;
    }
}
