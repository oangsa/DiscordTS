import type { ChatInputCommandInteraction,  } from "discord.js";
import type CustomClient from "../classes/CustomClient";
import type { KazagumoPlayer } from "kazagumo";

export default interface IPlayerManager {
    player: KazagumoPlayer;
    client: CustomClient;

    // Functional methods
    setRepeatMode(interaction: ChatInputCommandInteraction, mode: "track" | "queue" | "none"): void;
    setVolume(interaction: ChatInputCommandInteraction, volume: number): void;

    // Utility methods
    isSongPlaying(interaction: ChatInputCommandInteraction): boolean;
    checkForQueue(interaction: ChatInputCommandInteraction): boolean;

    // Getter methods
    getProgressbar(): string;
}
