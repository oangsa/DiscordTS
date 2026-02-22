import { ChatInputCommandInteraction, EmbedBuilder, Events } from "discord.js";
import CustomClient from "../../classes/CustomClient";
import Event from "../../classes/Event";

export default class CommandInteraction extends Event {
    constructor(client: CustomClient) {
        super(client as CustomClient, {
            name: Events.InteractionCreate,
            description: 'Event that fires when an interaction is created',
            isOnce: false,
            client: client
        })
    }

    public Execute(interaction: ChatInputCommandInteraction): void {
        if (!interaction.isCommand()) return;

        const command = this.client.commands.get(interaction.commandName)!;
        const devId: string[] = ["292560257828388867", "681746782635819025"];
        devId.push(this.client.config.devUserId);


        if (!command) {
            interaction.reply({
                content: "Invalid command",
                ephemeral: true
            });

            this.client.commands.delete(interaction.commandName);

            if (this.client.application) {
                this.client.application.commands.delete(interaction.commandId);
                this.client.logger.log(`Command ${interaction.commandName} has been deleted from the application commands`)
            }

            return;
        }

        if (!devId.includes(interaction.user.id) && command.dev) {
            interaction.reply({
                content: "This command is only available for the developer",
                flags: "Ephemeral"
            })

            return;
        }

        const { cooldowns } = this.client;
        if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Map());

        const now = Date.now();
        const timestamps = cooldowns.get(command.name)!;
        const cooldownAmount = (command.cooldown || 3) * 1000; // cooldown for 3 secs

        if (timestamps.has(interaction.user.id) && (now < (timestamps.get(interaction.user.id) || 0 ) + cooldownAmount)) {
            const timeLeft = (timestamps.get(interaction.user.id) || 0) + cooldownAmount - now;

            const embed = new EmbedBuilder()

            embed.setColor("Red")
            embed.setDescription(`Please wait ${timeLeft / 1000} more second(s) before using the command.`)

            interaction.reply({
                embeds: [embed],
                ephemeral: true
            })

            return;
        }

        timestamps.set(interaction.user.id, now);

        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            const subCommandGroup = interaction.options.getSubcommandGroup(false);
            const subCommand = `${interaction.commandName}${subCommandGroup ? `.${subCommandGroup}`: ""}.${interaction.options.getSubcommand(false) || ""}`

            return this.client.subCommands.get(subCommand)?.Execute(interaction) || command.Execute(interaction)
        }
        catch (error) {
            console.error(error);

            interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true
            });

            return;
        }
    }
}
