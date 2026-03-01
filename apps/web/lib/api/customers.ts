import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';
import { Customer, CustomerMeasurement } from '@/types/customers';
import { MeasurementCategory } from '@/types/config';

export const customerApi = {
  getCustomers: async (page = 1, limit = 20, search?: string) => {
    const response = await api.get<PaginatedResponse<Customer>>('/customers', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getCustomer: async (id: string) => {
    const response = await api.get<ApiResponse<Customer & { measurements: CustomerMeasurement[] }>>(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (data: Partial<Customer>) => {
    const response = await api.post<ApiResponse<Customer>>('/customers', data);
    return response.data;
  },

  updateCustomer: async (id: string, data: Partial<Customer>) => {
    const response = await api.patch<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/customers/${id}`);
    return response.data;
  },

  upsertMeasurements: async (customerId: string, categoryId: string, values: Record<string, unknown>) => {
    const response = await api.post<ApiResponse<CustomerMeasurement>>(`/customers/${customerId}/measurements`, {
      categoryId,
      values,
    });
    return response.data;
  },

  getMeasurementCategories: async () => {
    const response = await api.get<ApiResponse<MeasurementCategory[]>>('/config/measurement-categories');
    return response.data;
  },
};

export const customersApi = customerApi; // Alias for consistency
