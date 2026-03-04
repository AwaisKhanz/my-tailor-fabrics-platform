import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';
import type {
  AddEmployeeDocumentInput,
  CreateEmployeeInput,
  CreateEmployeeUserAccountInput,
  CreateEmployeeUserAccountResult,
  Employee,
  EmployeeDocument,
  EmployeeStatsSummary,
  UpdateEmployeeInput,
  EmployeeWithRelations,
  OrderItem,
} from '@tbms/shared-types';

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

export const employeesApi = {
  getEmployees: async (params: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Employee>>>('/employees', { params });
    return response.data;
  },
  getEmployee: async (id: string) => {
    const response = await api.get<ApiResponse<EmployeeWithRelations>>(`/employees/${id}`);
    return response.data;
  },
  createEmployee: async (data: CreateEmployeeInput) => {
    const response = await api.post<ApiResponse<Employee>>('/employees', data);
    return response.data;
  },
  updateEmployee: async (id: string, data: UpdateEmployeeInput) => {
    const response = await api.put<ApiResponse<Employee>>(`/employees/${id}`, data);
    return response.data;
  },
  deleteEmployee: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/employees/${id}`);
    return response.data;
  },
  getAssignedItems: async () => {
    const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>('/employees/my/items');
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
  getItems: async (id: string, params: { page?: number; limit?: number } = {}) => {
    const response = await api.get<ApiResponse<PaginatedResponse<OrderItem & { order: { orderNumber: string } }>>>(`/employees/${id}/items`, { params });
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
};
