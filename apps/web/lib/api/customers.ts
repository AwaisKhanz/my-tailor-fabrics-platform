import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';
import { Customer, CustomerMeasurement } from '@/types/customers';
import { CustomersListSummary, CustomerStatus, Order } from '@tbms/shared-types';

export const customerApi = {
  getCustomers: async (
    page = 1,
    limit = 20,
    search?: string,
    status?: CustomerStatus,
  ) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Customer>>>('/customers', {
      params: { page, limit, search, status },
    });
    return response.data;
  },

  getCustomersSummary: async (params?: {
    search?: string;
    status?: CustomerStatus;
    isVip?: boolean;
  }) => {
    const response = await api.get<ApiResponse<CustomersListSummary>>('/customers/summary', {
      params,
    });
    return response.data;
  },

  getCustomer: async (id: string) => {
    const response = await api.get<ApiResponse<Customer & { measurements: CustomerMeasurement[] }>>(`/customers/${id}`);
    return response.data;
  },

  getOrders: async (id: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>(`/customers/${id}/orders`, { params });
    return response.data;
  },

  createCustomer: async (data: Partial<Customer>) => {
    const response = await api.post<ApiResponse<Customer>>('/customers', data);
    return response.data;
  },

  updateCustomer: async (id: string, data: Partial<Customer>) => {
    const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
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
};

export const customersApi = customerApi; // Alias for consistency
