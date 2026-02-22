import type IApi from "../../infrastructure/interfaces/IApi";
import type IGoogleAccount from "../../interfaces/IGoogleAccount";
import type IGoogleAccountService from "../interfaces/IGoogleAccountService";
import type {
    CreateGoogleAccountRequest,
    SearchGoogleAccountsRequest,
    SearchGoogleAccountsResponse,
    UpdateGoogleAccountRequest
} from "../interfaces/IGoogleAccountService";

export default class GoogleAccountService implements IGoogleAccountService {
    private readonly api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    async searchGoogleAccounts(request: SearchGoogleAccountsRequest): Promise<SearchGoogleAccountsResponse> {
        return await this.api.postSearch<IGoogleAccount>('/GoogleAccount/Search', request);
    }

    async getGoogleAccountById(id: string): Promise<IGoogleAccount> {
        return await this.api.get<IGoogleAccount>(`/GoogleAccount/${id}`);
    }

    async updateGoogleAccount(id: string, request: UpdateGoogleAccountRequest): Promise<IGoogleAccount> {
        return await this.api.put<IGoogleAccount>(`/GoogleAccount/${id}`, request);
    }

    async deleteGoogleAccount(id: string): Promise<void> {
        await this.api.delete<void>(`/GoogleAccount/${id}`);
    }

    async createGoogleAccount(request: CreateGoogleAccountRequest): Promise<IGoogleAccount> {
        return await this.api.post<IGoogleAccount>('/GoogleAccount', request);
    }

    async deleteGoogleAccountsByIds(ids: string[]): Promise<void> {
        await this.api.delete<void>('/GoogleAccount/Collection', { ids });
    }
}
