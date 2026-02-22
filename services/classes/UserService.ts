import type IApi from "../../infrastructure/interfaces/IApi";
import type IUser from "../../interfaces/IUser";
import type IUserService from "../interfaces/IUserService";
import type {
    CreateUserRequest,
    SearchUsersRequest,
    SearchUsersResponse,
    UpdateUserRequest
} from "../interfaces/IUserService";

export default class UserService implements IUserService {
    private readonly api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    async searchUsers(request: SearchUsersRequest): Promise<SearchUsersResponse> {
        return await this.api.postSearch<IUser>('/User/Search', request);
    }

    async getUserById(id: string): Promise<IUser> {
        return await this.api.get<IUser>(`/User/${id}`);
    }

    async updateUser(id: string, request: UpdateUserRequest): Promise<IUser> {
        return await this.api.put<IUser>(`/User/${id}`, request);
    }

    async deleteUser(id: string): Promise<void> {
        await this.api.delete<void>(`/User/${id}`);
    }

    async createUser(request: CreateUserRequest): Promise<IUser> {
        return await this.api.post<IUser>('/User', request);
    }

    async deleteUsersByIds(ids: string[]): Promise<void> {
        await this.api.delete<void>('/User/Collection', { ids });
    }
}
