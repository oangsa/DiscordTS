import { EmbedBuilder, GuildMember, type ChatInputCommandInteraction } from "discord.js";
import type CustomClient from "../../../classes/CustomClient";
import SubCommand from "../../../classes/SubCommand";
import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import VoiceRecorder from "../../../classes/VoiceRecorder";

export default class VoiceStop extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "voice.stop",
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const { options, member, guild } = interaction;
        const embed = new EmbedBuilder().setColor("Blurple").setTimestamp();

        if(!guild || !member) return;

        await interaction.deferReply();
        const connection = getVoiceConnection(guild.id);

        if (!connection) {
            await interaction.editReply({ embeds: [embed.setDescription("There is no voice connection.")] });
            return
        }

        const buffer = await this.client.recorder.getRecordedVoiceAsBuffer(guild.id, "separate", this.client.timer.time * 60);

        this.client.recorder.stopRecording(connection);
        this.client.timer.stop();
        this.client.timer.reset();

        connection.destroy();
        connection.disconnect();

        await interaction.editReply({
            files: [ {
                attachment: buffer,
                contentType: "application/zip",
                name: "recording.zip",
            } ],
        });
    }
}
