import { api } from '../api';
import type {
  ApiResponse,
  DisbursePaymentInput,
  GenerateSalaryAccrualsInput,
  Payment,
  PaymentReversalResult,
  PaymentHistoryQueryInput,
  PaymentHistoryResult,
  PaymentSummary,
  ReversePaymentInput,
  SalaryAccrualGenerationResult,
} from '@tbms/shared-types';
import { toPaisaFromRupees } from '@/lib/utils/money';

export type { PaymentSummary };

export const paymentsApi = {
  getEmployeeSummary: async (employeeId: string) => {
    const response = await api.get<ApiResponse<PaymentSummary>>(`/payments/employee/${employeeId}/summary`);
    return response.data;
  },

  disburse: async (data: DisbursePaymentInput) => {
    const payload: DisbursePaymentInput = {
      ...data,
      amount: toPaisaFromRupees(data.amount),
    };
    const response = await api.post<ApiResponse<Payment>>('/payments', payload);
    return response.data;
  },

  reverse: async (id: string, data: ReversePaymentInput = {}) => {
    const response = await api.post<ApiResponse<PaymentReversalResult>>(
      `/payments/${id}/reverse`,
      data,
    );
    return response.data;
  },

  generateSalaryAccruals: async (data: GenerateSalaryAccrualsInput) => {
    const response = await api.post<ApiResponse<SalaryAccrualGenerationResult>>(
      '/payments/salary-accruals/generate',
      data,
    );
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
