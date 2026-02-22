import { EventStatus } from "../types/enums";

export default interface IEventEntity {
    id: string;
    createdBy: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    timezone: string;
    status: EventStatus;
    createdAt: string;
    updatedAt: string;
}
