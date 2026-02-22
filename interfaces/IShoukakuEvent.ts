export default interface IShoukakuEvent {
    name: string;

    Execute(...args: any[]): void;
}
