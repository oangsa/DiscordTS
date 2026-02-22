import type ITimer from "../interfaces/ITimer";

export default class Timer implements ITimer {
    private _time: number = 0;
    private _isRunning: boolean = true;

    public start(): void {
        this._isRunning = true;
        setTimeout(() => {
            this._time++;
            if (this._isRunning) {
                this.start();
            }
        }, 1000);
    }

    public stop(): void {
        if (this._isRunning) {
            this._isRunning = false;
        }
    }

    public reset(): void {
        this._time = 0;
    }

    public get time(): number {
        return this._time;
    }
}
