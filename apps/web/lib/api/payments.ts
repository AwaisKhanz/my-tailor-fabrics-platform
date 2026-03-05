import { api } from '../api';
import type {
  ApiResponse,
  DisbursePaymentInput,
  Payment,
  PaymentHistoryQueryInput,
  PaymentHistoryResult,
  PaymentSummary,
} from '@tbms/shared-types';

export type { PaymentSummary };

export const paymentsApi = {
  getEmployeeSummary: async (employeeId: string) => {
    const response = await api.get<ApiResponse<PaymentSummary>>(`/payments/employee/${employeeId}/summary`);
    return response.data;
  },

  disburse: async (data: DisbursePaymentInput) => {
    const response = await api.post<ApiResponse<Payment>>('/payments', data);
    return response.data;
  },

  getPaymentHistory: async (
    employeeId: string,
    params?: PaymentHistoryQueryInput,
  ) => {
    const response = await api.get<ApiResponse<PaymentHistoryResult>>(
      `/payments/employee/${employeeId}/history`,
      { params },
    );
    return response.data;
  },

  getWeeklyReportPdf: async () => {
    const response = await api.get<Blob>('/payments/weekly-report/pdf', {
      responseType: 'blob',
    });
    return response.data;
  },
};
