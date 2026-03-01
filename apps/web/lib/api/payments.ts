import { api } from '../api';
import { ApiResponse } from '@/types/common';

import { PaymentSummary } from '@tbms/shared-types';

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

  getPaymentHistory: async (employeeId: string, from?: string, to?: string) => {
    const params = { from, to };
    const response = await api.get<ApiResponse<unknown[]>>(`/payments/employee/${employeeId}/history`, { params });
    return response.data;
  },
};
