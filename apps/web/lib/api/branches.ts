import { api } from '../api';
import type {
  ApiResponse,
  Branch,
  BranchDetail,
  BranchListQueryInput,
  BranchListResult,
  BranchStatsSummary,
  CreateBranchInput,
  UpdateBranchInput,
} from '@tbms/shared-types';

export type { Branch };

export const branchesApi = {
  getBranches: async (params?: BranchListQueryInput) => {
    const response = await api.get<ApiResponse<BranchListResult>>(
      '/branches',
      { params },
    );
    return response.data;
  },
  
  getBranch: async (id: string) => {
    const response = await api.get<ApiResponse<BranchDetail>>(`/branches/${id}`);
    return response.data;
  },

  createBranch: async (data: CreateBranchInput) => {
    const response = await api.post<ApiResponse<Branch>>('/branches', data);
    return response.data;
  },

  updateBranch: async (id: string, data: UpdateBranchInput) => {
    const response = await api.put<ApiResponse<Branch>>(`/branches/${id}`, data);
    return response.data;
  },

  removeBranch: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/branches/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<ApiResponse<BranchStatsSummary>>('/branches/stats');
    return response.data;
  },
};
