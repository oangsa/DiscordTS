import type IShoukakuEvent from "../interfaces/IShoukakuEvent";

export default class ShoukakuEvent implements IShoukakuEvent {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    public Execute(...args: any[]): void {};
}
