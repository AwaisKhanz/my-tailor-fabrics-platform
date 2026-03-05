import { api } from '../api';
import type {
  ApiResponse,
  CreateUserInput,
  UserAccountsListResult,
  UserAccountsQueryInput,
  UpdateUserInput,
  UserAccount,
  UserStatsSummary,
} from '@tbms/shared-types';

export type { UserAccount };

export const usersApi = {
  getUsers: async (query: UserAccountsQueryInput = {}) => {
    const params = {
      page: query.page,
      limit: query.limit,
      search: query.search?.trim() || undefined,
      role: query.role,
      branchId: query.branchId,
    };
    const response = await api.get<ApiResponse<UserAccountsListResult>>(
      '/users',
      {
      params,
      },
    );
    return response.data;
  },

  createUser: async (data: CreateUserInput) => {
    const response = await api.post<ApiResponse<UserAccount>>('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserInput) => {
    const response = await api.patch<ApiResponse<UserAccount>>(`/users/${id}`, data);
    return response.data;
  },

  setActive: async (id: string, isActive: boolean) => {
    const response = await api.patch<ApiResponse<UserAccount>>(`/users/${id}/status`, { isActive });
    return response.data;
  },

  removeUser: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<ApiResponse<UserStatsSummary>>('/users/stats');
    return response.data;
  },
};
