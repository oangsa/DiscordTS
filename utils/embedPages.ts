import { ButtonStyle, ActionRowBuilder, ButtonBuilder, type ChatInputCommandInteraction, type EmbedBuilder, ButtonInteraction } from "discord.js";

export default async function embedPages(interaction: ChatInputCommandInteraction, embeds: EmbedBuilder[]): Promise<void> {
    const pages: { [key: string]: number } = {};

    const id = interaction.user.id;

    pages[id] = pages[id] || 0;

    const pageMax = embeds.length;

    const embed = embeds[pages[id]];

    embeds[pages[id]].setFooter({
        text: `Page ${pages[id] + 1} from ${pageMax}`,
    });

    const replyEmbed = await interaction.editReply({
        embeds: [embed],
        components: [getRow(id, pages, embeds)],
    });

    const filter = (i: any) => i.user.id == id;
    const time = 1000 * 60 * 5;

    const collector = replyEmbed.createMessageComponentCollector({
        filter,
        time,
    });

    collector.on("collect", async (buttonInteraction: ButtonInteraction) => {
        if (!buttonInteraction) return;
        if (buttonInteraction.customId !== "prev_embed" && buttonInteraction.customId !== "next_embed") return;

        if (buttonInteraction.customId === "prev_embed" && pages[id] > 0) --pages[id];
        else if (buttonInteraction.customId === "next_embed") ++pages[id];

        embeds[pages[id]].setFooter({
            text: `Page ${pages[id] + 1} of ${pageMax}`,
        });

        buttonInteraction.deferUpdate();
        return interaction.editReply({
            embeds: [embeds[pages[id]]],
            components: [getRow(id, pages, embeds)],
        });
    });

}

function getRow(id: string, pages: { [key: string]: number }, embeds: EmbedBuilder[]): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
            .setLabel("◀")
            .setCustomId("prev_embed")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pages[id] === 0),

        new ButtonBuilder()
            .setLabel("▶")
            .setCustomId("next_embed")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pages[id] === embeds.length - 1)
    );
    return row;
}
