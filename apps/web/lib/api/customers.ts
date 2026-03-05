import { api } from '../api';
import type {
  ApiResponse,
  CustomerDetail,
  CustomerMeasurement,
  CustomerOrdersQueryInput,
  CustomerOrdersResult,
  CreateCustomerInput,
  Customer,
  CustomersListQueryInput,
  CustomersListResult,
  CustomersListSummary,
  CustomersSummaryQueryInput,
  UpdateCustomerInput,
  UpsertCustomerMeasurementInput,
} from '@tbms/shared-types';

export const customerApi = {
  getCustomers: async (params: CustomersListQueryInput = {}) => {
    const response = await api.get<ApiResponse<CustomersListResult>>(
      '/customers',
      {
        params,
      },
    );
    return response.data;
  },

  getCustomersSummary: async (params: CustomersSummaryQueryInput = {}) => {
    const response = await api.get<ApiResponse<CustomersListSummary>>('/customers/summary', {
      params,
    });
    return response.data;
  },

  getCustomer: async (id: string) => {
    const response = await api.get<ApiResponse<CustomerDetail>>(`/customers/${id}`);
    return response.data;
  },

  getOrders: async (id: string, params: CustomerOrdersQueryInput = {}) => {
    const response = await api.get<ApiResponse<CustomerOrdersResult>>(
      `/customers/${id}/orders`,
      { params },
    );
    return response.data;
  },

  createCustomer: async (data: CreateCustomerInput) => {
    const response = await api.post<ApiResponse<Customer>>('/customers', data);
    return response.data;
  },

  updateCustomer: async (id: string, data: UpdateCustomerInput) => {
    const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/customers/${id}`);
    return response.data;
  },

  upsertMeasurements: async (
    customerId: string,
    categoryId: string,
    values: UpsertCustomerMeasurementInput["values"],
  ) => {
    const response = await api.post<ApiResponse<CustomerMeasurement>>(`/customers/${customerId}/measurements`, {
      categoryId,
      values,
    });
    return response.data;
  },
};

export const customersApi = customerApi; // Alias for consistency
