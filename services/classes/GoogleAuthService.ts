import type IApi from "../../infrastructure/interfaces/IApi";
import type IGoogleAuthService from "../interfaces/IGoogleAuthService";
import type {
    GoogleAuthCallbackRequest,
    GoogleAuthCallbackResponse,
    GoogleAuthUrlResponse,
    RefreshTokenResponse
} from "../interfaces/IGoogleAuthService";

export default class GoogleAuthService implements IGoogleAuthService {
    private readonly api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    async getAuthUrl(discordId: string): Promise<GoogleAuthUrlResponse> {
        return await this.api.get<GoogleAuthUrlResponse>('/GoogleAuth/url', { discordId });
    }

    async handleCallback(request: GoogleAuthCallbackRequest): Promise<GoogleAuthCallbackResponse> {
        return await this.api.get<GoogleAuthCallbackResponse>('/GoogleAuth/callback', request);
    }

    async refreshToken(userId: string): Promise<RefreshTokenResponse> {
        return await this.api.post<RefreshTokenResponse>(`/GoogleAuth/refresh/${userId}`);
    }
}
