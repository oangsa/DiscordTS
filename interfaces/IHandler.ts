import type CustomClient from "../classes/CustomClient";

type PromiseVoidFunction = () => Promise<void>


export default interface IHandler {
    LoadEvents: PromiseVoidFunction;
    LoadCommands: PromiseVoidFunction;
    LoadAntiCrash: VoidFunction;
}
