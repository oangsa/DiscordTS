import { ChatInputCommandInteraction } from 'discord.js';
import type ISubCommand from '../interfaces/ISubCommand';
import type ISubCommandOptions from '../interfaces/ISubCommandOption';
import CustomClient from './CustomClient';

export default class SubCommand implements ISubCommand {
    public name: string;
    public client: CustomClient;

    constructor(client: CustomClient, option: ISubCommandOptions) {
        this.client = client;
        this.name = option.name;
    }

    public Execute(interaction: ChatInputCommandInteraction): void {}
}
