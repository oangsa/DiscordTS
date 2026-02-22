import type IGoogleAccount from "../../interfaces/IGoogleAccount";
import type { PaginationMetaData, SearchUsersRequest } from "./IUserService";

export interface SearchGoogleAccountsRequest extends SearchUsersRequest {}

export interface SearchGoogleAccountsResponse {
    data: IGoogleAccount[];
    meta: PaginationMetaData;
}

export interface CreateGoogleAccountRequest {
    userId: string;
    googleUserId: string;
    email: string;
    calendarId?: string;
    scope?: string;
}

export interface UpdateGoogleAccountRequest {
    email?: string;
    calendarId?: string;
    scope?: string;
}

export default interface IGoogleAccountService {
    searchGoogleAccounts(request: SearchGoogleAccountsRequest): Promise<SearchGoogleAccountsResponse>;
    getGoogleAccountById(id: string): Promise<IGoogleAccount>;
    updateGoogleAccount(id: string, request: UpdateGoogleAccountRequest): Promise<IGoogleAccount>;
    deleteGoogleAccount(id: string): Promise<void>;
    createGoogleAccount(request: CreateGoogleAccountRequest): Promise<IGoogleAccount>;
    deleteGoogleAccountsByIds(ids: string[]): Promise<void>;
}
