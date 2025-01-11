import { Collection, Events, REST, Routes } from "discord.js";
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
        console.log(`Logged in as ${this.client.user?.tag}`);

        const commands: CommandJSON[] = this.getJSON(this.client.commands);

        const rest = new REST().setToken(this.client.config.token);

        const setCommand: any = await rest.put(Routes.applicationGuildCommands(this.client.config.discordClientId, this.client.config.guildId), {
            body: commands
        });

        console.log(`Successfully set ${setCommand.length} commands!`)
    }

    private getJSON(commands: Map<string, Command>): CommandJSON[] {
        const json: CommandJSON[] = [];

        commands.forEach((cmd: Command) => {
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
