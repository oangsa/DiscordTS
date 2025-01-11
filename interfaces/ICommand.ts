import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";

export default interface ICommand {
    client: CustomClient;
    name: string;
    description: string;
    defaultMemberPermissions: bigint;
    dmPermissions: boolean;
    cooldown: number;

    Execute(interaction: ChatInputCommandInteraction): void;
    AutoComplete(interaction: AutocompleteInteraction): void;
}
