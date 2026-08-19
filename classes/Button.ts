import { ButtonInteraction } from "discord.js";
import type IButton from "../interfaces/IButton";
import type IButtonOptions from "../interfaces/IButtonOptions";
import CustomClient from "./CustomClient";

export default class Button implements IButton {
    client: CustomClient;
    customId: string;

    constructor(client: CustomClient, options: IButtonOptions) {
        this.client = client;
        this.customId = options.customId;
    }

    public Execute(interaction: ButtonInteraction): void {}
}
