import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';

import { UserAccount } from '@tbms/shared-types';

export type { UserAccount };

export const usersApi = {
  getUsers: async (branchId?: string) => {
    const params = branchId ? { branchId } : {};
    const response = await api.get<ApiResponse<PaginatedResponse<UserAccount>>>('/users', { params });
    return response.data;
  },

  createUser: async (data: {
    name: string;
    email: string;
    password?: string;
    role: string;
    branchId?: string;
  }) => {
    const response = await api.post<ApiResponse<UserAccount>>('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    branchId?: string;
  }) => {
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
    const response = await api.get<ApiResponse<{ total: number; active: number; privileged: number }>>('/users/stats');
    return response.data;
  },
};
