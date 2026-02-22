// Enums
export { EventStatus, ParticipantRole, ResponseStatus, SyncStatus } from "./types/enums";

// Entity Interfaces
export type { default as IUser } from "./interfaces/IUser";
export type { default as IEventEntity } from "./interfaces/IEventEntity";
export type { default as IEventParticipant } from "./interfaces/IEventParticipant";
export type { default as ICalendarSync } from "./interfaces/ICalendarSync";
export type { default as IOAuthToken } from "./interfaces/IOAuthToken";
export type { default as IGoogleAccount } from "./interfaces/IGoogleAccount";

// Service Interfaces
export type { default as IUserService } from "./services/interfaces/IUserService";
export type { default as IEventService } from "./services/interfaces/IEventService";
export type { default as IEventParticipantService } from "./services/interfaces/IEventParticipantService";
export type { default as IGoogleAccountService } from "./services/interfaces/IGoogleAccountService";
export type { default as IGoogleAuthService } from "./services/interfaces/IGoogleAuthService";
export type { default as ICalendarSyncService } from "./services/interfaces/ICalendarSyncService";

// Service Request/Response Types
export type {
    SearchUsersRequest,
    SearchUsersResponse,
    CreateUserRequest,
    UpdateUserRequest,
    PaginationMetaData
} from "./services/interfaces/IUserService";

export type {
    SearchEventsRequest,
    SearchEventsResponse,
    CreateEventRequest,
    UpdateEventRequest
} from "./services/interfaces/IEventService";

export type {
    SearchEventParticipantsRequest,
    SearchEventParticipantsResponse,
    AddEventParticipantRequest,
    DeleteEventParticipantKey
} from "./services/interfaces/IEventParticipantService";

export type {
    SearchGoogleAccountsRequest,
    SearchGoogleAccountsResponse,
    CreateGoogleAccountRequest,
    UpdateGoogleAccountRequest
} from "./services/interfaces/IGoogleAccountService";

export type {
    GoogleAuthUrlResponse,
    GoogleAuthCallbackRequest,
    GoogleAuthCallbackResponse,
    RefreshTokenRequest,
    RefreshTokenResponse
} from "./services/interfaces/IGoogleAuthService";

export type {
    SearchCalendarSyncRequest,
    SearchCalendarSyncResponse,
    CreateCalendarSyncRequest,
    UpdateCalendarSyncRequest
} from "./services/interfaces/ICalendarSyncService";

// Service Container
export { default as ServiceContainer } from "./services/ServiceContainer";

// Infrastructure
export { default as Api } from "./infrastructure/classes/Api";
export type { default as IApi } from "./infrastructure/interfaces/IApi";
