type PromiseVoidFunction = () => Promise<void>


export default interface IHandler {
    LoadEvents: PromiseVoidFunction;
    LoadCommands: PromiseVoidFunction;
}
