import type { PaginationMetaData } from "../../services/interfaces/IUserService";

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMetaData;
}

export default interface IApi {
    get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
    post<T>(endpoint: string, body?: any): Promise<T>;
    postSearch<T>(endpoint: string, body?: any): Promise<PaginatedResponse<T>>;
    put<T>(endpoint: string, body?: any): Promise<T>;
    delete<T>(endpoint: string, body?: any): Promise<T>;
}
