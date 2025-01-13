export default interface ITimer {
    start(): void;
    stop(): void;
    reset(): void;

    get time(): number; // in seconds

}
