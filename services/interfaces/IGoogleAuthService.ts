export interface GoogleAuthUrlResponse {
    url: string;
}

export interface GoogleAuthCallbackRequest {
    code: string;
    state?: string;
}

export interface GoogleAuthCallbackResponse {
    success: boolean;
    userId?: string;
    message?: string;
}

export interface RefreshTokenRequest {
    userId: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    expiresAt: Date;
}

export default interface IGoogleAuthService {
    getAuthUrl(discordId: string): Promise<GoogleAuthUrlResponse>;
    handleCallback(request: GoogleAuthCallbackRequest): Promise<GoogleAuthCallbackResponse>;
    refreshToken(userId: string): Promise<RefreshTokenResponse>;
}
