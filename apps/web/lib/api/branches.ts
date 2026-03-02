import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';

import { Branch } from '@tbms/shared-types';

export type { Branch };

export const branchesApi = {
  getBranches: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Branch>>>('/branches', { params });
    return response.data;
  },
  
  getBranch: async (id: string) => {
    const response = await api.get<ApiResponse<Branch>>(`/branches/${id}`);
    return response.data;
  },

  createBranch: async (data: { code: string; name: string; address?: string; phone?: string }) => {
    const response = await api.post<ApiResponse<Branch>>('/branches', data);
    return response.data;
  },

  updateBranch: async (id: string, data: Partial<Branch>) => {
    const response = await api.put<ApiResponse<Branch>>(`/branches/${id}`, data);
    return response.data;
  },

  removeBranch: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/branches/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<ApiResponse<{ total: number; active: number; inactive: number }>>('/branches/stats');
    return response.data;
  },
};
