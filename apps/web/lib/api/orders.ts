import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';
import { Order, OrderStatus, DashboardStats } from '@tbms/shared-types';

export const ordersApi = {
  getOrders: async (params: { page?: number; limit?: number; status?: string; search?: string }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>('/orders', { params });
    return response.data;
  },
  getOrder: async (id: string) => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },
  createOrder: async (data: Record<string, unknown>) => {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
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
  getDashboardStats: async (): Promise<DashboardStats> => {
    // Fetch overdue and recent orders in parallel, then derive stats
    const [overdueRes, recentRes] = await Promise.all([
      api.get<ApiResponse<Order[]>>('/orders', { params: { status: OrderStatus.OVERDUE, limit: 100 } }),
      api.get<ApiResponse<Order[]>>('/orders', { params: { limit: 5 } }),
    ]);
    const overdueOrders = overdueRes.data.data ?? [];
    const recentOrders = recentRes.data.data ?? [];

    return {
      overdueCount: overdueOrders.length,
      recentOrders,
      // These fields come from a dedicated endpoint if available, otherwise 0
      totalOrders: 0,
      newToday: 0,
      totalOutstandingBalance: overdueOrders.reduce((sum, o) => sum + (o.balanceDue ?? 0), 0),
      totalCustomers: 0,
      activeEmployees: 0,
    };
  },
};
