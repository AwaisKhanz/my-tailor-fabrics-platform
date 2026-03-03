import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';
import {
  Order,
  OrderStatus,
  DashboardStats,
  CreateOrderInput,
  UpdateOrderInput,
  OrderItemTask,
  OrdersListSummary,
  TaskStatus,
} from '@tbms/shared-types';

export const ordersApi = {
  getOrders: async (params: { page?: number; limit?: number; status?: string; search?: string; from?: string; to?: string }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>('/orders', { params });
    return response.data;
  },
  getOrdersSummary: async (params: { status?: string; search?: string; from?: string; to?: string }) => {
    const response = await api.get<ApiResponse<OrdersListSummary>>('/orders/summary', { params });
    return response.data;
  },
  getOrder: async (id: string) => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },
  getReceiptPdf: async (id: string) => {
    const response = await api.get(`/orders/${id}/receipt`, {
      responseType: "blob",
    });
    return response.data as Blob;
  },
  createOrder: async (data: CreateOrderInput) => {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },
  updateOrder: async (id: string, data: UpdateOrderInput) => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: string, data: { status: OrderStatus; note?: string }) => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, data);
    return response.data;
  },
  addPayment: async (id: string, data: { amount: number; note?: string }) => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${id}/payment`, data);
    return response.data;
  },
  shareOrder: async (id: string) => {
    const response = await api.post<ApiResponse<unknown>>(`/orders/${id}/share`);
    return response.data;
  },
  updateItem: async (orderId: string, itemId: string, data: { status?: string; employeeId?: string }) => {
    const response = await api.patch<ApiResponse<unknown>>(`/orders/${orderId}/items/${itemId}`, data);
    return response.data;
  },
  removeItem: async (orderId: string, itemId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/orders/${orderId}/items/${itemId}`);
    return response.data;
  },

  // -- Tasks --
  assignTask: async (taskId: string, employeeId: string) => {
    const response = await api.patch<ApiResponse<OrderItemTask>>(`/tasks/${taskId}/assign`, { employeeId });
    return response.data;
  },
  updateTaskStatus: async (taskId: string, status: TaskStatus) => {
    const response = await api.patch<ApiResponse<OrderItemTask>>(`/tasks/${taskId}/status`, { status });
    return response.data;
  },
  updateTaskRate: async (taskId: string, rateOverride: number) => {
    const response = await api.patch<ApiResponse<OrderItemTask>>(`/tasks/${taskId}/rate`, { rateOverride });
    return response.data;
  },
  getTasksByEmployee: async (employeeId: string) => {
    const response = await api.get<ApiResponse<OrderItemTask[]>>(`/tasks/employee/${employeeId}`);
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/reports/dashboard');
    return response.data.data;
  },
};
