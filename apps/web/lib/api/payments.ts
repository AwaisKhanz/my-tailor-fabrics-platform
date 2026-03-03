import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';
import { PaymentSummary, Payment } from '@tbms/shared-types';

export type { PaymentSummary };

type LegacyPaymentHistoryResponse = ApiResponse<Payment[]> & {
  meta?: {
    total?: number;
    page?: number;
    lastPage?: number;
  };
};

function isLegacyPaymentHistoryResponse(
  payload: ApiResponse<PaginatedResponse<Payment>> | LegacyPaymentHistoryResponse,
): payload is LegacyPaymentHistoryResponse {
  return Array.isArray(payload.data);
}

function normalizePaymentHistoryResponse(
  payload: ApiResponse<PaginatedResponse<Payment>> | LegacyPaymentHistoryResponse,
): ApiResponse<PaginatedResponse<Payment>> {
  if (isLegacyPaymentHistoryResponse(payload)) {
    return {
      ...payload,
      data: {
        data: payload.data,
        total: payload.meta?.total ?? payload.data.length,
      },
    };
  }

  return payload as ApiResponse<PaginatedResponse<Payment>>;
}

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
    const response = await api.get<
      ApiResponse<PaginatedResponse<Payment>> | LegacyPaymentHistoryResponse
    >(`/payments/employee/${employeeId}/history`, { params });
    return normalizePaymentHistoryResponse(response.data);
  },

  getWeeklyReportPdf: async () => {
    const response = await api.get('/payments/weekly-report/pdf', { responseType: 'blob' });
    return response.data as Blob;
  },
};
