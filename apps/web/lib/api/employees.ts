import { api } from '../api';
import { PaymentType } from '@tbms/shared-types';
import type {
  ApiResponse,
  AddEmployeeDocumentInput,
  CompensationChangeInput,
  CreateEmployeeInput,
  CreateEmployeeUserAccountInput,
  CreateEmployeeUserAccountResult,
  Employee,
  EmployeeCapability,
  EmployeeCapabilitySnapshot,
  EmployeeCompensationHistoryEntry,
  EmployeeAssignedItemsResult,
  EmployeeDocument,
  EmployeeItemsQueryInput,
  EmployeeItemsResult,
  EmployeeListQueryInput,
  EmployeeListResult,
  EligibleEmployeeQueryInput,
  EligibleEmployeeResult,
  EmployeeStatsSummary,
  UpdateEmployeeInput,
  EmployeeWithRelations,
} from '@tbms/shared-types';
import { toPaisaFromRupees } from '@/lib/utils/money';

export type { EmployeeWithRelations };

const normalizeEmployeeStats = (
  stats: EmployeeStatsSummary & { currentBalance?: number },
): EmployeeStatsSummary => {
  const balance = stats.balance ?? stats.currentBalance ?? 0;
  return {
    ...stats,
    balance,
    currentBalance: stats.currentBalance ?? balance,
  };
};

function toEmployeePayloadWithPaisa<T extends CreateEmployeeInput | UpdateEmployeeInput>(
  data: T,
): T {
  const shouldClearMonthlySalary = data.paymentType === PaymentType.PER_PIECE;
  const monthlySalary = data.monthlySalary;
  const shouldConvertMonthlySalary =
    !shouldClearMonthlySalary && monthlySalary !== undefined;

  return {
    ...data,
    monthlySalary: shouldClearMonthlySalary
      ? undefined
      : shouldConvertMonthlySalary
        ? toPaisaFromRupees(monthlySalary)
        : monthlySalary,
  };
}

export const employeesApi = {
  getEmployees: async (params: EmployeeListQueryInput = {}) => {
    const response = await api.get<ApiResponse<EmployeeListResult>>(
      '/employees',
      { params },
    );
    return response.data;
  },
  getEmployee: async (id: string) => {
    const response = await api.get<ApiResponse<EmployeeWithRelations>>(`/employees/${id}`);
    return response.data;
  },
  createEmployee: async (data: CreateEmployeeInput) => {
    const payload = toEmployeePayloadWithPaisa(data);
    const response = await api.post<ApiResponse<Employee>>('/employees', payload);
    return response.data;
  },
  updateEmployee: async (id: string, data: UpdateEmployeeInput) => {
    const payload = toEmployeePayloadWithPaisa(data);
    const response = await api.put<ApiResponse<Employee>>(`/employees/${id}`, payload);
    return response.data;
  },
  deleteEmployee: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/employees/${id}`);
    return response.data;
  },
  getAssignedItems: async () => {
    const response = await api.get<ApiResponse<EmployeeAssignedItemsResult>>(
      '/employees/my/items',
    );
    return response.data;
  },
  getMyProfile: async () => {
    const response = await api.get<ApiResponse<EmployeeWithRelations>>('/employees/my/profile');
    return response.data;
  },
  getMyStats: async () => {
    const response = await api.get<ApiResponse<EmployeeStatsSummary>>('/employees/my/stats');
    response.data.data = normalizeEmployeeStats(response.data.data);
    return response.data;
  },
  getStats: async (id: string) => {
    const response = await api.get<ApiResponse<EmployeeStatsSummary>>(`/employees/${id}/stats`);
    response.data.data = normalizeEmployeeStats(response.data.data);
    return response.data;
  },
  getItems: async (id: string, params: EmployeeItemsQueryInput = {}) => {
    const response = await api.get<ApiResponse<EmployeeItemsResult>>(
      `/employees/${id}/items`,
      { params },
    );
    return response.data;
  },
  uploadDocument: async (id: string, data: AddEmployeeDocumentInput) => {
    const response = await api.post<ApiResponse<EmployeeDocument>>(`/employees/${id}/documents`, data);
    return response.data;
  },
  createUserAccount: async (id: string, data: CreateEmployeeUserAccountInput) => {
    const response = await api.post<ApiResponse<CreateEmployeeUserAccountResult>>(`/employees/${id}/user-account`, data);
    return response.data;
  },
  getCapabilities: async (
    id: string,
    params: { activeOnly?: boolean; asOf?: string } = {},
  ) => {
    const response = await api.get<ApiResponse<EmployeeCapability[]>>(
      `/employees/${id}/capabilities`,
      { params },
    );
    return response.data;
  },
  replaceCapabilities: async (id: string, data: EmployeeCapabilitySnapshot) => {
    const response = await api.put<ApiResponse<EmployeeCapability[]>>(
      `/employees/${id}/capabilities`,
      data,
    );
    return response.data;
  },
  getCompensationHistory: async (id: string) => {
    const response = await api.get<ApiResponse<EmployeeCompensationHistoryEntry[]>>(
      `/employees/${id}/compensation`,
    );
    return response.data;
  },
  createCompensationChange: async (id: string, data: CompensationChangeInput) => {
    const payload: CompensationChangeInput = {
      ...data,
      monthlySalary:
        data.paymentType === PaymentType.MONTHLY_FIXED &&
        data.monthlySalary !== undefined
          ? toPaisaFromRupees(data.monthlySalary)
          : undefined,
    };
    const response = await api.post<ApiResponse<EmployeeCompensationHistoryEntry>>(
      `/employees/${id}/compensation`,
      payload,
    );
    return response.data;
  },
  getEligibleEmployees: async (params: EligibleEmployeeQueryInput) => {
    const response = await api.get<ApiResponse<EligibleEmployeeResult[]>>(
      '/employees/eligible',
      { params },
    );
    return response.data;
  },
};
