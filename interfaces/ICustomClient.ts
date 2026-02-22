import type { Client } from "discord.js";
import Command from "../classes/Command";
import SubCommand from "../classes/SubCommand";
import type CustomKazagumo from "../classes/CustomShoukaku";
import type IConfig from "./IConfig";
import type Logger from "../classes/Logger";
import type Timer from "../classes/Timer";
import type VoiceRecorder from "../classes/VoiceRecorder";
import type ServiceContainer from "../services/ServiceContainer";

export default interface ICustomClient extends Client {
    config: IConfig;
    commands: Map<string, Command>;
    subCommands: Map<string, SubCommand>;
    cooldowns: Map<string, Map<string, number>>;
    developmentMode: boolean;
    kazagumo: CustomKazagumo;
    logger: Logger;
    timer: Timer;
    recorder: VoiceRecorder;
    services: ServiceContainer;

    Start(): void;
}
