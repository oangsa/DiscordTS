import type CustomClient from "../classes/CustomClient";

export default interface ILogger {
    client: CustomClient;

    log(message: string): void;
    error(message: string): void;
    warn(message: string): void;
}
