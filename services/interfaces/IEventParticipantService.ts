import type IEventParticipant from "../../interfaces/IEventParticipant";
import { ParticipantRole, ResponseStatus } from "../../types/enums";
import type { PaginationMetaData, SearchUsersRequest } from "./IUserService";

export interface SearchEventParticipantsRequest extends SearchUsersRequest {}

export interface SearchEventParticipantsResponse {
    data: IEventParticipant[];
    meta: PaginationMetaData;
}

export interface AddEventParticipantRequest {
    eventId: string;
    userId: string;
    role?: ParticipantRole;
    responseStatus?: ResponseStatus;
}

export interface DeleteEventParticipantKey {
    eventId: string;
    userId: string;
}

export default interface IEventParticipantService {
    searchEventParticipants(request: SearchEventParticipantsRequest): Promise<SearchEventParticipantsResponse>;
    getParticipantByCompositeKey(eventId: string, userId: string): Promise<IEventParticipant>;
    deleteParticipant(eventId: string, userId: string): Promise<void>;
    addEventParticipant(request: AddEventParticipantRequest): Promise<IEventParticipant>;
    deleteParticipantsByKeys(keys: DeleteEventParticipantKey[]): Promise<void>;
}
