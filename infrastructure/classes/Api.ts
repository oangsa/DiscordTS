import type IApi from "../interfaces/IApi";
import type { PaginatedResponse } from "../interfaces/IApi";
import type { PaginationMetaData } from "../../services/interfaces/IUserService";

export default class Api implements IApi {
    private readonly baseUrl: string;
    private readonly defaultHeaders: Record<string, string>;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    private toCamelCase(str: string): string {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    private mapKeys<T>(obj: any): T {
        if (obj === null || obj === undefined) return obj;
        if (Array.isArray(obj)) return obj.map(item => this.mapKeys(item)) as T;
        if (typeof obj !== 'object') return obj;

        const mapped: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
            mapped[this.toCamelCase(key)] = this.mapKeys(value);
        }
        return mapped as T;
    }

    private buildUrl(endpoint: string, params?: Record<string, any>): string {
        const url = new URL(endpoint, this.baseUrl);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }
        return url.toString();
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            const json = await response.json();
            return this.mapKeys<T>(json);
        }

        return {} as T;
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const url = this.buildUrl(endpoint, params);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.defaultHeaders
        });
        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, body?: any): Promise<T> {
        const url = this.buildUrl(endpoint);
        const response = await fetch(url, {
            method: 'POST',
            headers: this.defaultHeaders,
            body: body ? JSON.stringify(body) : undefined
        });
        return this.handleResponse<T>(response);
    }

    async postSearch<T>(endpoint: string, body?: any): Promise<PaginatedResponse<T>> {
        const url = this.buildUrl(endpoint);
        const response = await fetch(url, {
            method: 'POST',
            headers: this.defaultHeaders,
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const raw = await response.json();
        const data = this.mapKeys<T[]>(raw);

        const paginationHeader = response.headers.get('x-pagination');
        let meta: PaginationMetaData = {
            currentPage: 1,
            totalPages: 0,
            pageSize: 10,
            totalCount: 0,
            hasPrevious: false,
            hasNext: false
        };

        if (paginationHeader) {
            const parsed = JSON.parse(paginationHeader);
            meta = {
                currentPage: parsed.CurrentPage,
                totalPages: parsed.TotalPages,
                pageSize: parsed.PageSize,
                totalCount: parsed.TotalCount,
                hasPrevious: parsed.HasPrevious ?? false,
                hasNext: parsed.HasNext ?? false
            };
        }

        return { data, meta };
    }

    async put<T>(endpoint: string, body?: any): Promise<T> {
        const url = this.buildUrl(endpoint);
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.defaultHeaders,
            body: body ? JSON.stringify(body) : undefined
        });
        return this.handleResponse<T>(response);
    }

    async delete<T>(endpoint: string, body?: any): Promise<T> {
        const url = this.buildUrl(endpoint);
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.defaultHeaders,
            body: body ? JSON.stringify(body) : undefined
        });
        return this.handleResponse<T>(response);
    }
}
