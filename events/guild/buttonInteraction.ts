import { ButtonInteraction, Events } from "discord.js";
import CustomClient from "../../classes/CustomClient";
import Event from "../../classes/Event";

export default class ButtonInteractionEvent extends Event {
    constructor(client: CustomClient) {
        super(client as CustomClient, {
            name: Events.InteractionCreate,
            description: 'Event that fires when a button is pressed',
            isOnce: false,
            client: client
        })
    }

    public async Execute(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.isButton()) return;

        // Buttons owned by a message component collector (embed pages) are not registered here.
        const button = this.client.buttons.get(interaction.customId);

        if (!button) return;

        try {
            await button.Execute(interaction);
        }
        catch (error) {
            console.error(error);

            const content = "Something went wrong while running this button. Please try again.";

            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ content, flags: "Ephemeral" });
            } else {
                await interaction.reply({ content, flags: "Ephemeral" });
            }

            return;
        }
    }
}
