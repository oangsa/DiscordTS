import { EmbedBuilder, GuildMember, type ChatInputCommandInteraction } from "discord.js";
import type CustomClient from "../../../classes/CustomClient";
import SubCommand from "../../../classes/SubCommand";
import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import VoiceRecorder from "../../../classes/VoiceRecorder";

export default class VoiceRecord extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "voice.record",
        });
    }

    public async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const { options, member, guild } = interaction;
        const embed = new EmbedBuilder().setColor("Blurple").setTimestamp();

        if(!guild || !member) return;

        await interaction.deferReply();
        const connection = getVoiceConnection(guild.id);

        if (!connection) {
            const channel = (member as GuildMember).voice.channel;
            if (!channel) {
                await interaction.editReply({ embeds: [embed.setDescription("You must be in a voice channel to use this command.")] });
                return;
            }

            const recorder = joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: false,
            });

            this.client.recorder.startRecording(recorder);
            this.client.timer.start();

            await interaction.editReply({ embeds: [embed.setDescription("Recording has started.")] });
        }

    }
}
