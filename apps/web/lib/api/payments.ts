import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';
import { PaymentSummary, Payment } from '@tbms/shared-types';

export type { PaymentSummary };

export const paymentsApi = {
  getEmployeeSummary: async (employeeId: string) => {
    const response = await api.get<ApiResponse<PaymentSummary>>(`/payments/employee/${employeeId}/summary`);
    return response.data;
  },

  disburse: async (data: { employeeId: string; amount: number; note?: string }) => {
    const response = await api.post<ApiResponse<unknown>>('/payments', data);
    return response.data;
  },

  getPaymentHistory: async (employeeId: string, params?: { page?: number; limit?: number; from?: string; to?: string }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Payment>>>(`/payments/employee/${employeeId}/history`, { params });
    return response.data;
  },
};
