import type { Client } from "discord.js";
import Command from "../classes/Command";
import SubCommand from "../classes/SubCommand";
import type CustomKazagumo from "../classes/CustomShoukaku";

export default interface ICustomClient extends Client {
    commands: Map<string, Command>;
    subCommands: Map<string, SubCommand>;
    cooldowns: Map<string, Map<string, number>>;

    kazagumo: CustomKazagumo;

    Start(): void;
}
