import type IApi from "../../infrastructure/interfaces/IApi";
import type IEventEntity from "../../interfaces/IEventEntity";
import type IEventService from "../interfaces/IEventService";
import type {
    CreateEventRequest,
    SearchEventsRequest,
    SearchEventsResponse,
    UpdateEventRequest
} from "../interfaces/IEventService";

export default class EventService implements IEventService {
    private readonly api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    async searchEvents(request: SearchEventsRequest): Promise<SearchEventsResponse> {
        return await this.api.postSearch<IEventEntity>('/Event/Search', request);
    }

    async getEventById(id: string): Promise<IEventEntity> {
        return await this.api.get<IEventEntity>(`/Event/${id}`);
    }

    async updateEvent(id: string, request: UpdateEventRequest): Promise<IEventEntity> {
        return await this.api.put<IEventEntity>(`/Event/${id}`, request);
    }

    async deleteEvent(id: string): Promise<void> {
        await this.api.delete<void>(`/Event/${id}`);
    }

    async createEvent(request: CreateEventRequest): Promise<IEventEntity> {
        return await this.api.post<IEventEntity>('/Event', request);
    }

    async deleteEventsByIds(ids: string[]): Promise<void> {
        await this.api.delete<void>('/Event/Collection', { ids });
    }
}
