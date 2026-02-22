import type IApi from "../../infrastructure/interfaces/IApi";
import type ICalendarSync from "../../interfaces/ICalendarSync";
import type ICalendarSyncService from "../interfaces/ICalendarSyncService";
import type {
    CreateCalendarSyncRequest,
    SearchCalendarSyncRequest,
    SearchCalendarSyncResponse,
    UpdateCalendarSyncRequest
} from "../interfaces/ICalendarSyncService";

export default class CalendarSyncService implements ICalendarSyncService {
    private readonly api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    async searchCalendarSync(request: SearchCalendarSyncRequest): Promise<SearchCalendarSyncResponse> {
        return await this.api.postSearch<ICalendarSync>('/CalendarSync/Search', request);
    }

    async getCalendarSyncById(id: string): Promise<ICalendarSync> {
        return await this.api.get<ICalendarSync>(`/CalendarSync/${id}`);
    }

    async updateCalendarSync(id: string, request: UpdateCalendarSyncRequest): Promise<ICalendarSync> {
        return await this.api.put<ICalendarSync>(`/CalendarSync/${id}`, request);
    }

    async deleteCalendarSync(id: string): Promise<void> {
        await this.api.delete<void>(`/CalendarSync/${id}`);
    }

    async createCalendarSync(request: CreateCalendarSyncRequest): Promise<ICalendarSync> {
        return await this.api.post<ICalendarSync>('/CalendarSync', request);
    }

    async deleteCalendarSyncByIds(ids: string[]): Promise<void> {
        await this.api.delete<void>('/CalendarSync/Collection', { ids });
    }

    async syncEventToAll(eventId: string): Promise<void> {
        await this.api.post<void>(`/CalendarSync/Event/${eventId}/Sync`);
    }

    async syncEventForUser(eventId: string, userId: string): Promise<void> {
        await this.api.post<void>(`/CalendarSync/Event/${eventId}/User/${userId}/Sync`);
    }

    async updateSyncedEvent(eventId: string): Promise<void> {
        await this.api.put<void>(`/CalendarSync/Event/${eventId}/Sync`);
    }

    async removeSyncFromAll(eventId: string): Promise<void> {
        await this.api.delete<void>(`/CalendarSync/Event/${eventId}/Sync`);
    }

    async removeSyncForUser(eventId: string, userId: string): Promise<void> {
        await this.api.delete<void>(`/CalendarSync/Event/${eventId}/User/${userId}/Sync`);
    }
}
