import type ICalendarSync from "../../interfaces/ICalendarSync";
import { SyncStatus } from "../../types/enums";
import type { PaginationMetaData, SearchUsersRequest } from "./IUserService";

export interface SearchCalendarSyncRequest extends SearchUsersRequest {}

export interface SearchCalendarSyncResponse {
    data: ICalendarSync[];
    meta: PaginationMetaData;
}

export interface CreateCalendarSyncRequest {
    eventId: string;
    userId: string;
    googleEventId?: string;
    syncStatus?: SyncStatus;
}

export interface UpdateCalendarSyncRequest {
    googleEventId?: string;
    syncStatus?: SyncStatus;
    lastSyncedAt?: Date;
    errorMessage?: string;
}

export default interface ICalendarSyncService {
    searchCalendarSync(request: SearchCalendarSyncRequest): Promise<SearchCalendarSyncResponse>;
    getCalendarSyncById(id: string): Promise<ICalendarSync>;
    updateCalendarSync(id: string, request: UpdateCalendarSyncRequest): Promise<ICalendarSync>;
    deleteCalendarSync(id: string): Promise<void>;
    createCalendarSync(request: CreateCalendarSyncRequest): Promise<ICalendarSync>;
    deleteCalendarSyncByIds(ids: string[]): Promise<void>;
    syncEventToAll(eventId: string): Promise<void>;
    syncEventForUser(eventId: string, userId: string): Promise<void>;
    updateSyncedEvent(eventId: string): Promise<void>;
    removeSyncFromAll(eventId: string): Promise<void>;
    removeSyncForUser(eventId: string, userId: string): Promise<void>;
}
