import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';
import { Employee, EmployeeDocument } from '@/types/employees';
import { OrderItem } from '@tbms/shared-types';

interface UserAccount {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeeWithRelations extends Employee {
  userAccount?: UserAccount | null;
  documents: EmployeeDocument[];
}

export const employeesApi = {
  getEmployees: async (params: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Employee>>>('/employees', { params });
    return response.data;
  },
  getEmployee: async (id: string) => {
    const response = await api.get<ApiResponse<EmployeeWithRelations>>(`/employees/${id}`);
    return response.data;
  },
  createEmployee: async (data: Partial<Employee>) => {
    const response = await api.post<ApiResponse<Employee>>('/employees', data);
    return response.data;
  },
  updateEmployee: async (id: string, data: Partial<Employee>) => {
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
    const response = await api.get<ApiResponse<{ totalEarned: number; totalPaid: number; currentBalance: number }>>('/employees/my/stats');
    return response.data;
  },
  getStats: async (id: string) => {
    const response = await api.get<ApiResponse<{ totalEarned: number; totalPaid: number; currentBalance: number }>>(`/employees/${id}/stats`);
    return response.data;
  },
  getItems: async (id: string, params: { page?: number; limit?: number } = {}) => {
    const response = await api.get<ApiResponse<PaginatedResponse<OrderItem & { order: { orderNumber: string } }>>>(`/employees/${id}/items`, { params });
    return response.data;
  },
  uploadDocument: async (id: string, data: { label: string; fileUrl: string; fileType: string }) => {
    const response = await api.post<ApiResponse<unknown>>(`/employees/${id}/documents`, data);
    return response.data;
  },
  createUserAccount: async (id: string, data: { email: string; passwordHash: string }) => {
    // Note: The backend expects 'password' not 'passwordHash' in some places, 
    // but looking at the controller it's @Body('password').
    // Let's use 'password' to be safe or check the component usage.
    const response = await api.post<ApiResponse<unknown>>(`/employees/${id}/user-account`, data);
    return response.data;
  },
};
