import { api } from "../api";
import type {
  AddonAnalytics,
  ApiResponse,
  DashboardStats,
  DesignAnalytics,
  EmployeeProductivity,
  GarmentRevenue,
  ReportSummary,
  RevenueVsExpenses,
} from "@tbms/shared-types";

export type {
  DesignAnalytics,
  AddonAnalytics,
  ReportSummary,
  RevenueVsExpenses,
  GarmentRevenue,
  EmployeeProductivity,
};

export const reportsApi = {
  getDashboardStats: (branchId?: string) =>
    api.get<ApiResponse<DashboardStats>>("/reports/dashboard", { params: { branchId } }).then((res) => res.data.data),

  getDesigns: (from?: string, to?: string, branchId?: string) =>
    api.get<ApiResponse<DesignAnalytics[]>>("/reports/designs", { params: { from, to, branchId } }).then((res) => res.data),

  getAddons: (from?: string, to?: string, branchId?: string) =>
    api.get<ApiResponse<AddonAnalytics[]>>("/reports/addons", { params: { from, to, branchId } }).then((res) => res.data),

  getSummary: (from?: string, to?: string, branchId?: string) =>
    api.get<ApiResponse<ReportSummary>>("/reports/summary", { params: { from, to, branchId } }).then((res) => res.data),

  getRevenueVsExpenses: (months = 6, branchId?: string) =>
    api.get<ApiResponse<RevenueVsExpenses>>("/reports/revenue-vs-expenses", { params: { months, branchId } }).then((res) => res.data),

  getGarments: (branchId?: string) =>
    api.get<ApiResponse<GarmentRevenue[]>>("/reports/garments", { params: { branchId } }).then((res) => res.data),

  getProductivity: (branchId?: string) =>
    api.get<ApiResponse<EmployeeProductivity[]>>("/reports/productivity", { params: { branchId } }).then((res) => res.data),

  exportReport: async (type: string, format: string, from?: string, to?: string) => {
    const response = await api.get(`/reports/export/${type}`, {
      params: { format, from, to },
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
