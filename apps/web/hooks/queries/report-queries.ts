"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports";
import { reportKeys } from "@/lib/query-keys";
import type {
  ReportExportFormat,
  ReportExportType,
  TrendGranularity,
} from "@tbms/shared-types";

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function useDashboardStats(branchId?: string, enabled = true) {
  return useQuery({
    queryKey: reportKeys.dashboard(branchId),
    queryFn: () => reportsApi.getDashboardStats(branchId),
    enabled,
  });
}

export function useDashboardDesigns(
  from?: string,
  to?: string,
  branchId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: reportKeys.designs({ from, to, branchId }),
    queryFn: () => reportsApi.getDesigns(from, to, branchId),
    enabled,
  });
}

export function useDashboardProductivity(branchId?: string, enabled = true) {
  return useQuery({
    queryKey: reportKeys.productivity({ branchId }),
    queryFn: () => reportsApi.getProductivity(branchId),
    enabled,
  });
}

export function useDashboardGarments(
  branchId?: string,
  from?: string,
  to?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: reportKeys.garmentRevenue({ branchId, from, to }),
    queryFn: () => reportsApi.getGarments(branchId, from, to),
    enabled,
  });
}

export function useDashboardRevenueExpenses(
  months = 6,
  branchId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: reportKeys.revenueExpenses({ months, branchId }),
    queryFn: () => reportsApi.getRevenueVsExpenses(months, branchId),
    enabled,
  });
}

// ─── Reports Workspace ────────────────────────────────────────────────────────

export function useReportsSummary(
  from?: string,
  to?: string,
  branchId?: string,
) {
  return useQuery({
    queryKey: reportKeys.summary({ from, to, branchId }),
    queryFn: () => reportsApi.getSummary(from, to, branchId),
    enabled: !!from && !!to,
  });
}

export function useFinancialTrend(
  from?: string,
  to?: string,
  granularity?: TrendGranularity,
  branchId?: string,
) {
  return useQuery({
    queryKey: reportKeys.financialTrend({ from, to, granularity, branchId }),
    queryFn: () =>
      reportsApi.getFinancialTrend(from, to, granularity, branchId),
    enabled: !!from && !!to,
  });
}

export function useReportsDistributions(
  from?: string,
  to?: string,
  branchId?: string,
) {
  return useQuery({
    queryKey: reportKeys.distributions({ from, to, branchId }),
    queryFn: () => reportsApi.getDistributions(from, to, branchId),
    enabled: !!from && !!to,
  });
}

export function useReportsProductivityRange(
  from?: string,
  to?: string,
  limit = 10,
  branchId?: string,
) {
  return useQuery({
    queryKey: reportKeys.employeeProductivity({ from, to, limit, branchId }),
    queryFn: () => reportsApi.getProductivityRange(from, to, limit, branchId),
    enabled: !!from && !!to,
  });
}

// ─── Export mutation (fires a one-off download) ───────────────────────────────

export function useExportReport() {
  return useMutation({
    mutationFn: ({
      type,
      format,
      from,
      to,
    }: {
      type: ReportExportType;
      format: ReportExportFormat;
      from?: string;
      to?: string;
    }) => reportsApi.exportReport(type, format, from, to),
  });
}
