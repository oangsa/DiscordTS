import Api from "../infrastructure/classes/Api";
import CalendarSyncService from "./classes/CalendarSyncService";
import EventParticipantService from "./classes/EventParticipantService";
import EventService from "./classes/EventService";
import GoogleAccountService from "./classes/GoogleAccountService";
import GoogleAuthService from "./classes/GoogleAuthService";
import UserService from "./classes/UserService";
import type IApi from "../infrastructure/interfaces/IApi";
import type ICalendarSyncService from "./interfaces/ICalendarSyncService";
import type IEventParticipantService from "./interfaces/IEventParticipantService";
import type IEventService from "./interfaces/IEventService";
import type IGoogleAccountService from "./interfaces/IGoogleAccountService";
import type IGoogleAuthService from "./interfaces/IGoogleAuthService";
import type IUserService from "./interfaces/IUserService";

export default class ServiceContainer {
    private readonly api: IApi;

    public readonly users: IUserService;
    public readonly events: IEventService;
    public readonly eventParticipants: IEventParticipantService;
    public readonly googleAccounts: IGoogleAccountService;
    public readonly googleAuth: IGoogleAuthService;
    public readonly calendarSync: ICalendarSyncService;

    constructor(apiBaseUrl: string) {
        this.api = new Api(apiBaseUrl);

        this.users = new UserService(this.api);
        this.events = new EventService(this.api);
        this.eventParticipants = new EventParticipantService(this.api);
        this.googleAccounts = new GoogleAccountService(this.api);
        this.googleAuth = new GoogleAuthService(this.api);
        this.calendarSync = new CalendarSyncService(this.api);
    }

    public getApi(): IApi {
        return this.api;
    }
}
