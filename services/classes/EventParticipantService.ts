import type IApi from "../../infrastructure/interfaces/IApi";
import type IEventParticipant from "../../interfaces/IEventParticipant";
import type IEventParticipantService from "../interfaces/IEventParticipantService";
import type {
    AddEventParticipantRequest,
    DeleteEventParticipantKey,
    SearchEventParticipantsRequest,
    SearchEventParticipantsResponse
} from "../interfaces/IEventParticipantService";

export default class EventParticipantService implements IEventParticipantService {
    private readonly api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    async searchEventParticipants(request: SearchEventParticipantsRequest): Promise<SearchEventParticipantsResponse> {
        return await this.api.postSearch<IEventParticipant>('/EventParticipant/Search', request);
    }

    async getParticipantByCompositeKey(eventId: string, userId: string): Promise<IEventParticipant> {
        return await this.api.get<IEventParticipant>(`/EventParticipant/${eventId}/${userId}`);
    }

    async deleteParticipant(eventId: string, userId: string): Promise<void> {
        await this.api.delete<void>(`/EventParticipant/${eventId}/${userId}`);
    }

    async addEventParticipant(request: AddEventParticipantRequest): Promise<IEventParticipant> {
        return await this.api.post<IEventParticipant>('/EventParticipant', request);
    }

    async deleteParticipantsByKeys(keys: DeleteEventParticipantKey[]): Promise<void> {
        await this.api.delete<void>('/EventParticipant/Collection', { keys });
    }
}
