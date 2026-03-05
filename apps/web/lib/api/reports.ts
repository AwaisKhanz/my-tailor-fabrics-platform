import { api } from "../api";
import type {
  AddonAnalytics,
  AddonsAnalyticsQueryInput,
  ApiResponse,
  DashboardStatsQueryInput,
  DesignsAnalyticsQueryInput,
  DistributionsQueryInput,
  FinancialTrend,
  FinancialTrendQueryInput,
  GarmentRevenueQueryInput,
  DashboardStats,
  DesignAnalytics,
  DistributionPoint,
  EmployeeProductivity,
  GarmentRevenue,
  ProductivityPoint,
  ProductivityQueryInput,
  ReportExportQueryInput,
  ReportExportFormat,
  ReportExportType,
  ReportDistributions,
  ReportSummary,
  RevenueVsExpensesQueryInput,
  ReportsRangeQueryInput,
  SummaryQueryInput,
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
  ReportExportFormat,
  ReportExportType,
  ReportsRangeQueryInput,
  DashboardStatsQueryInput,
  DesignsAnalyticsQueryInput,
  AddonsAnalyticsQueryInput,
  SummaryQueryInput,
  FinancialTrendQueryInput,
  DistributionsQueryInput,
  RevenueVsExpensesQueryInput,
  GarmentRevenueQueryInput,
  ProductivityQueryInput,
  ReportExportQueryInput,
};

export const reportsApi = {
  getDashboardStats: (branchId?: string) =>
    api
      .get<ApiResponse<DashboardStats>>("/reports/dashboard", {
        params: { branchId } satisfies DashboardStatsQueryInput,
      })
      .then((res) => res.data),

  getDesigns: (from?: string, to?: string, branchId?: string) =>
    api
      .get<ApiResponse<DesignAnalytics[]>>("/reports/designs", {
        params: { from, to, branchId } satisfies DesignsAnalyticsQueryInput,
      })
      .then((res) => res.data),

  getAddons: (from?: string, to?: string, branchId?: string) =>
    api
      .get<ApiResponse<AddonAnalytics[]>>("/reports/addons", {
        params: { from, to, branchId } satisfies AddonsAnalyticsQueryInput,
      })
      .then((res) => res.data),

  getSummary: (from?: string, to?: string, branchId?: string) =>
    api
      .get<ApiResponse<ReportSummary>>("/reports/summary", {
        params: { from, to, branchId } satisfies SummaryQueryInput,
      })
      .then((res) => res.data),

  getFinancialTrend: (from?: string, to?: string, granularity?: TrendGranularity, branchId?: string) =>
    api
      .get<ApiResponse<FinancialTrend>>("/reports/financial-trend", {
        params: {
          from,
          to,
          granularity,
          branchId,
        } satisfies FinancialTrendQueryInput,
      })
      .then((res) => res.data),

  getDistributions: (from?: string, to?: string, branchId?: string) =>
    api
      .get<ApiResponse<ReportDistributions>>("/reports/distributions", {
        params: { from, to, branchId } satisfies DistributionsQueryInput,
      })
      .then((res) => res.data),

  getRevenueVsExpenses: (months = 6, branchId?: string) =>
    api
      .get<ApiResponse<RevenueVsExpenses>>("/reports/revenue-vs-expenses", {
        params: { months, branchId } satisfies RevenueVsExpensesQueryInput,
      })
      .then((res) => res.data),

  getGarments: (branchId?: string, from?: string, to?: string) =>
    api
      .get<ApiResponse<GarmentRevenue[]>>("/reports/garments", {
        params: { branchId, from, to } satisfies GarmentRevenueQueryInput,
      })
      .then((res) => res.data),

  getProductivityRange: (from?: string, to?: string, limit = 10, branchId?: string) =>
    api
      .get<ApiResponse<ProductivityPoint[]>>("/reports/productivity", {
        params: {
          from,
          to,
          limit,
          branchId,
        } satisfies ProductivityQueryInput,
      })
      .then((res) => res.data),

  getProductivity: async (branchId?: string) => {
    const response = await api.get<ApiResponse<ProductivityPoint[]>>("/reports/productivity", {
      params: { branchId, limit: 10 } satisfies ProductivityQueryInput,
    });

    const payload: ApiResponse<EmployeeProductivity[]> = {
      success: response.data.success,
      data: response.data.data.map((entry) => ({
        label: entry.employeeName,
        value: entry.totalCompleted,
      })),
      message: response.data.message,
      error: response.data.error,
    };

    return payload;
  },

  exportReport: async (
    type: ReportExportType,
    format: ReportExportFormat,
    from?: string,
    to?: string,
  ) => {
    const params: ReportExportQueryInput = { format, from, to };
    const response = await api.get<Blob>(`/reports/export/${type}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
