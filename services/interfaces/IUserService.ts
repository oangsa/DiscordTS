import type IUser from "../../interfaces/IUser";

export interface SearchFilter {
    alias?: string;
    name: string;
    condition?: string;
    value: string;
}

export interface SearchTerm {
    alias?: string;
    name: string;
    value: string;
}

export interface SearchRequest {
    pageNumber?: number;
    pageSize?: number;
    search?: SearchFilter[];
    searchTerm?: SearchTerm;
    orderBy?: string;
    deleted?: boolean;
}

export interface SearchUsersRequest extends SearchRequest {}

export interface PaginationMetaData {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface SearchUsersResponse {
    data: IUser[];
    meta: PaginationMetaData;
}

export interface CreateUserRequest {
    discordId: string;
    username?: string;
    globalName?: string;
    avatarUrl?: string;
}

export interface UpdateUserRequest {
    username?: string;
    globalName?: string;
    avatarUrl?: string;
}

export default interface IUserService {
    searchUsers(request: SearchUsersRequest): Promise<SearchUsersResponse>;
    getUserById(id: string): Promise<IUser>;
    updateUser(id: string, request: UpdateUserRequest): Promise<IUser>;
    deleteUser(id: string): Promise<void>;
    createUser(request: CreateUserRequest): Promise<IUser>;
    deleteUsersByIds(ids: string[]): Promise<void>;
}
