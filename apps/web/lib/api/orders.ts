import { api } from '../api';
import type {
  ApiResponse,
  AddOrderPaymentInput,
  CreateOrderInput,
  DashboardStats,
  Order,
  OrderItem,
  OrderItemTask,
  OrdersListQueryInput,
  OrdersListResult,
  OrdersListSummary,
  OrdersSummaryQueryInput,
  SharedOrderTokenPayload,
  TaskStatus,
  UpdateOrderItemStatusInput,
  UpdateOrderInput,
  UpdateOrderStatusInput,
} from '@tbms/shared-types';

export const ordersApi = {
  getOrders: async (params: OrdersListQueryInput = {}) => {
    const response = await api.get<ApiResponse<OrdersListResult>>('/orders', { params });
    return response.data;
  },
  getOrdersSummary: async (params: OrdersSummaryQueryInput = {}) => {
    const response = await api.get<ApiResponse<OrdersListSummary>>('/orders/summary', { params });
    return response.data;
  },
  getOrder: async (id: string) => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },
  getReceiptPdf: async (id: string) => {
    const response = await api.get<Blob>(`/orders/${id}/receipt`, {
      responseType: "blob",
    });
    return response.data;
  },
  createOrder: async (data: CreateOrderInput) => {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },
  updateOrder: async (id: string, data: UpdateOrderInput) => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: string, data: UpdateOrderStatusInput) => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, data);
    return response.data;
  },
  addPayment: async (id: string, data: AddOrderPaymentInput) => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${id}/payment`, data);
    return response.data;
  },
  shareOrder: async (id: string) => {
    const response = await api.post<ApiResponse<SharedOrderTokenPayload>>(`/orders/${id}/share`);
    return response.data;
  },
  updateItem: async (
    orderId: string,
    itemId: string,
    data: UpdateOrderItemStatusInput,
  ) => {
    const response = await api.patch<ApiResponse<OrderItem>>(`/orders/${orderId}/items/${itemId}`, data);
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

  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/reports/dashboard');
    return response.data;
  },
};
