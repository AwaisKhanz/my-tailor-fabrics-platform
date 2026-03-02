import { api } from '../api';
import { ApiResponse } from '@/types/common';
import { RateCard, CreateRateCardInput, PaginatedResponse } from '@tbms/shared-types';

export const ratesApi = {
  findAll: async (params: { search?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    
    const response = await api.get<ApiResponse<PaginatedResponse<RateCard>>>(`/rates?${query.toString()}`);
    return response.data;
  },
  getHistory: async (garmentTypeId: string, stepKey: string, branchId?: string | null) => {
    const query = new URLSearchParams();
    query.append('garmentTypeId', garmentTypeId);
    query.append('stepKey', stepKey);
    if (branchId) query.append('branchId', branchId);
    
    const response = await api.get<ApiResponse<RateCard[]>>(`/rates/history?${query.toString()}`);
    return response.data;
  },
  create: async (data: CreateRateCardInput) => {
    const response = await api.post<ApiResponse<RateCard>>('/rates', data);
    return response.data;
  }
};
