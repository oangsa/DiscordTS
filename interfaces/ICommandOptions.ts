import { Category } from "../enums/Category";

export default interface ICommandOptions {
    name: string;
    description: string;
    category: Category;
    options: object;
    defaultMemberPermissions: bigint;
    dmPermissions: boolean;
    cooldown: number;
    dev: boolean;
}
