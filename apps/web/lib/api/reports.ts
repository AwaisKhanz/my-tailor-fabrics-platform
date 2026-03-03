import { api } from "../api";
import type {
  AddonAnalytics,
  ApiResponse,
  FinancialTrend,
  DashboardStats,
  DesignAnalytics,
  DistributionPoint,
  EmployeeProductivity,
  GarmentRevenue,
  ProductivityPoint,
  ReportDistributions,
  ReportSummary,
  RevenueVsExpenses,
  TrendGranularity,
} from "@tbms/shared-types";

export type {
  DesignAnalytics,
  AddonAnalytics,
  FinancialTrend,
  DistributionPoint,
  ProductivityPoint,
  ReportDistributions,
  TrendGranularity,
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

  getFinancialTrend: (from?: string, to?: string, granularity?: TrendGranularity, branchId?: string) =>
    api
      .get<ApiResponse<FinancialTrend>>("/reports/financial-trend", {
        params: { from, to, granularity, branchId },
      })
      .then((res) => res.data),

  getDistributions: (from?: string, to?: string, branchId?: string) =>
    api
      .get<ApiResponse<ReportDistributions>>("/reports/distributions", {
        params: { from, to, branchId },
      })
      .then((res) => res.data),

  getRevenueVsExpenses: (months = 6, branchId?: string) =>
    api.get<ApiResponse<RevenueVsExpenses>>("/reports/revenue-vs-expenses", { params: { months, branchId } }).then((res) => res.data),

  getGarments: (branchId?: string, from?: string, to?: string) =>
    api.get<ApiResponse<GarmentRevenue[]>>("/reports/garments", { params: { branchId, from, to } }).then((res) => res.data),

  getProductivityRange: (from?: string, to?: string, limit = 10, branchId?: string) =>
    api
      .get<ApiResponse<ProductivityPoint[]>>("/reports/productivity", {
        params: { from, to, limit, branchId },
      })
      .then((res) => res.data),

  getProductivity: async (branchId?: string) => {
    const response = await api.get<ApiResponse<ProductivityPoint[]>>("/reports/productivity", {
      params: { branchId, limit: 10 },
    });

    return {
      ...response.data,
      data: response.data.data.map((entry) => ({
        label: entry.employeeName,
        value: entry.totalCompleted,
      })),
    } as ApiResponse<EmployeeProductivity[]>;
  },

  exportReport: async (type: string, format: string, from?: string, to?: string) => {
    const response = await api.get(`/reports/export/${type}`, {
      params: { format, from, to },
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
