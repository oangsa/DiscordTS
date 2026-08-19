import { ButtonInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";

export default interface IButton {
    client: CustomClient;
    customId: string;

    Execute(interaction: ButtonInteraction): void;
}
