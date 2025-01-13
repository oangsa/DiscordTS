import { Events, EmbedBuilder, VoiceState, GuildMemberManager, ClientUser, GuildMember, type VoiceBasedChannel, Guild, TextChannel } from "discord.js";
import CustomClient from "../../classes/CustomClient";
import Event from "../../classes/Event";

export default class VoiceStateUpdate extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.VoiceStateUpdate,
            description: '',
            isOnce: false,
            client: client
        });
    }

    public async Execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
        const player = this.client.kazagumo.shoukaku.players.get(newState.guild.id);

        if (!newState.guild.members.me?.voice.channel) player?.destroy();

        if ((oldState.guild.members as GuildMemberManager).cache.get((this.client.user as ClientUser).id)?.voice?.channelId === oldState.channelId) {
            if ((oldState.guild.members.me as GuildMember).voice?.channel && oldState.channel?.members.filter(m => !m.user.bot).size === 0) {
                const members = ((oldState.guild.members.me as GuildMember).voice.channel as VoiceBasedChannel).members.size;

                if (!members || members == 1) {
                    const guild = this.client.guilds.cache.get(newState.guild.id) as Guild;
                    const textChannel = guild.channels.cache.get(player?.textId as string) as TextChannel;

                    setTimeout(() => {
                        if (player) {
                            player.destroy();
                        }

                        if (oldState.guild.members.me?.voice?.channel) {
                            oldState.guild.members.me.voice.disconnect();
                        }

                        textChannel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor("Blurple")
                                    .setDescription("I have left the voice channel because I was alone.")
                                    .setTimestamp()
                            ]
                        })
                    }, 15000);
                }
            }
        }

    }
}
