import type ICommand from "../interfaces/ICommand";
import CustomClient from "./CustomClient";
import type ICommandOptions from "../interfaces/ICommandOptions";
import { ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import { Category } from "../enums/Category";

export default class Command implements ICommand {
    client: CustomClient;
    name: string;
    description: string;
    category: Category;
    options: object;
    defaultMemberPermissions: bigint;
    dmPermissions: boolean;
    cooldown: number;
    dev: boolean;

    constructor(client: CustomClient, options: ICommandOptions) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.category = options.category;
        this.options = options.options;
        this.defaultMemberPermissions = options.defaultMemberPermissions;
        this.dmPermissions = options.dmPermissions;
        this.cooldown = options.cooldown;
        this.dev = options.dev;
    }

    public Execute(interaction: ChatInputCommandInteraction): void {}
    public AutoComplete(interaction: AutocompleteInteraction): void {}

}
