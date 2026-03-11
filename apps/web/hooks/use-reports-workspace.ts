"use client";

import { useCallback, useMemo, useState } from "react";
import type { TrendGranularity } from "@tbms/shared-types";
import {
  type DateRangeValue,
  getDefaultReportRange,
  getPresetRange,
  type ReportDatePreset,
  REPORT_DATE_PRESET_OPTIONS,
  resolveGranularityByRange,
  sanitizeRange,
} from "@/lib/reports-date";
import { useToast } from "@/hooks/use-toast";
import {
  useExportReport,
  useFinancialTrend,
  useReportsDistributions,
  useReportsProductivityRange,
  useReportsSummary,
} from "@/hooks/queries/report-queries";
import { useWeeklyReportPdf } from "@/hooks/queries/payment-queries";

type ReportFormat = "pdf" | "excel";

export type ReportExportType = "orders" | "payments" | "expenses";
export type ReportsWorkspaceTab =
  | "overview"
  | "financial"
  | "operations"
  | "exports";

function triggerDownload(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function useReportsWorkspace() {
  const { toast } = useToast();
  const exportReportMutation = useExportReport();
  const weeklyReportPdfMutation = useWeeklyReportPdf();

  const defaultRange = useMemo(() => getDefaultReportRange(), []);
  const [activeTab, setActiveTab] = useState<ReportsWorkspaceTab>("overview");

  const [preset, setPreset] = useState<ReportDatePreset>("30d");
  const [dateRange, setDateRange] = useState<DateRangeValue>(defaultRange);
  const [granularity, setGranularity] = useState<TrendGranularity>(
    resolveGranularityByRange(defaultRange),
  );

  const summaryQuery = useReportsSummary(dateRange.from, dateRange.to);
  const trendQuery = useFinancialTrend(
    dateRange.from,
    dateRange.to,
    granularity,
  );
  const distributionsQuery = useReportsDistributions(
    dateRange.from,
    dateRange.to,
  );
  const productivityQuery = useReportsProductivityRange(
    dateRange.from,
    dateRange.to,
    10,
  );

  const loading =
    summaryQuery.isLoading ||
    trendQuery.isLoading ||
    distributionsQuery.isLoading ||
    productivityQuery.isLoading;

  const summary = summaryQuery.data?.success ? summaryQuery.data.data : null;
  const financialTrend = trendQuery.data?.success ? trendQuery.data.data : null;
  const distributions = distributionsQuery.data?.success
    ? distributionsQuery.data.data
    : null;
  const productivity = productivityQuery.data?.success
    ? productivityQuery.data.data
    : [];

  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const printingWeekly = weeklyReportPdfMutation.isPending;

  const refreshAnalytics = useCallback(async () => {
    try {
      await Promise.all([
        summaryQuery.refetch(),
        trendQuery.refetch(),
        distributionsQuery.refetch(),
        productivityQuery.refetch(),
      ]);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load report analytics",
        variant: "destructive",
      });
    }
  }, [distributionsQuery, productivityQuery, summaryQuery, toast, trendQuery]);

  const applyPreset = useCallback((nextPreset: ReportDatePreset) => {
    setPreset(nextPreset);

    if (nextPreset === "custom") {
      return;
    }

    const nextRange = getPresetRange(nextPreset);
    setDateRange(nextRange);
    setGranularity(resolveGranularityByRange(nextRange));
  }, []);

  const setDateRangeValue = useCallback(
    (field: keyof DateRangeValue, value: string) => {
      setPreset("custom");
      setDateRange((previous) => {
        const next = sanitizeRange({
          ...previous,
          [field]: value,
        });

        return next;
      });
    },
    [],
  );

  const exportReport = useCallback(
    async (type: ReportExportType, format: ReportFormat) => {
      const key = `${type}:${format}`;
      setExportingKey(key);

      try {
        toast({ title: `Generating ${type} ${format.toUpperCase()}...` });

        const blob = await exportReportMutation.mutateAsync({
          type,
          format,
          from: dateRange.from,
          to: dateRange.to,
        });

        triggerDownload(
          blob,
          `${type}_report_${dateRange.from}_to_${dateRange.to}.${format === "excel" ? "xlsx" : "pdf"}`,
        );
      } catch {
        toast({
          title: "Export Failed",
          description: "Failed to generate the report. Please try again.",
          variant: "destructive",
        });
      } finally {
        setExportingKey(null);
      }
    },
    [dateRange.from, dateRange.to, exportReportMutation, toast],
  );

  const printWeeklySummary = useCallback(async () => {
    try {
      toast({ title: "Generating Print View..." });
      const blob = await weeklyReportPdfMutation.mutateAsync();
      triggerDownload(blob, "weekly_production_summary.pdf");
    } catch {
      toast({
        title: "Print Failed",
        description: "Failed to generate the print view.",
        variant: "destructive",
      });
    }
  }, [toast, weeklyReportPdfMutation]);

  return {
    activeTab,
    setActiveTab,
    preset,
    applyPreset,
    dateRange,
    setDateRangeValue,
    granularity,
    setGranularity,
    datePresetOptions: REPORT_DATE_PRESET_OPTIONS,
    loading,
    summary,
    financialTrend,
    distributions,
    productivity,
    exportingKey,
    printingWeekly,
    refreshAnalytics,
    exportReport,
    printWeeklySummary,
  };
}
