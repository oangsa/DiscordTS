import type IEventEntity from "../../interfaces/IEventEntity";
import { EventStatus } from "../../types/enums";
import type { PaginationMetaData, SearchUsersRequest } from "./IUserService";

export interface SearchEventsRequest extends SearchUsersRequest {}

export interface SearchEventsResponse {
    data: IEventEntity[];
    meta: PaginationMetaData;
}

export interface CreateEventRequest {
    createdBy: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    timezone: string;
    status?: EventStatus;
}

export interface UpdateEventRequest {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    timezone?: string;
    status?: EventStatus;
}

export default interface IEventService {
    searchEvents(request: SearchEventsRequest): Promise<SearchEventsResponse>;
    getEventById(id: string): Promise<IEventEntity>;
    updateEvent(id: string, request: UpdateEventRequest): Promise<IEventEntity>;
    deleteEvent(id: string): Promise<void>;
    createEvent(request: CreateEventRequest): Promise<IEventEntity>;
    deleteEventsByIds(ids: string[]): Promise<void>;
}
