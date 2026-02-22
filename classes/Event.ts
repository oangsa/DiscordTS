import CustomClient from "./CustomClient";
import type IEvent from "../interfaces/IEvent";
import { Events } from "discord.js";

export default class Event implements IEvent {
    client: CustomClient;
    name: Events;
    description: string;
    isOnce: boolean;

    constructor(client: CustomClient, options: IEvent) {
        this.client = client
        this.name = options.name;
        this.description = options.description;
        this.isOnce = options.isOnce;
    }

    public Execute(...args: any): void {}
}
