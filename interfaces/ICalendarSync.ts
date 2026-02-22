import { SyncStatus } from "../types/enums";

export default interface ICalendarSync {
    id: string;
    eventId: string;
    userId: string;
    googleEventId: string | null;
    syncStatus: SyncStatus;
    lastSyncedAt: string | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
}
