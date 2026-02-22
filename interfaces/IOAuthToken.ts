export default interface IOAuthToken {
    id: string;
    googleAccountId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}
