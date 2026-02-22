export enum EventStatus {
    SCHEDULED = 'scheduled',
    CANCELLED = 'cancelled'
}

export enum ParticipantRole {
    OWNER = 'owner',
    ATTENDEE = 'attendee'
}

export enum ResponseStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined'
}

export enum SyncStatus {
    PENDING = 'pending',
    SYNCED = 'synced',
    FAILED = 'failed'
}
