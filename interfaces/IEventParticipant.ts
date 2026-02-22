import { ParticipantRole, ResponseStatus } from "../types/enums";

export default interface IEventParticipant {
    eventId: string;
    userId: string;
    role: ParticipantRole;
    responseStatus: ResponseStatus;
    addedAt: string;
}
