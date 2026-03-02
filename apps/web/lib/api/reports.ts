import { api } from '../api';
import { ApiResponse } from '@/types/common';
import { DashboardStats } from '@tbms/shared-types';

export const reportsApi = {
  getDashboardStats: async (branchId?: string) => {
    const response = await api.get<ApiResponse<DashboardStats>>('/reports/dashboard', {
      params: { branchId }
    });
    return response.data.data;
  },
  
  getRevenueVsExpenses: async (params?: { branchId?: string; months?: number }) => {
    const response = await api.get<ApiResponse<{
      revenue: { month: string; total: number }[];
      expenses: { month: string; total: number }[];
    }>>('/reports/revenue-vs-expenses', { params });
    return response.data;
  }
};
