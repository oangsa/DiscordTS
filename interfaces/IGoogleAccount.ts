export default interface IGoogleAccount {
    id: string;
    userId: string;
    googleUserId: string;
    email: string;
    calendarId: string;
    scope: string;
    connectedAt: string;
    revokedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
