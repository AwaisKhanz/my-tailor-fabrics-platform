"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  FinancialTrend,
  ProductivityPoint,
  ReportDistributions,
  ReportSummary,
  TrendGranularity,
} from "@tbms/shared-types";
import { reportsApi } from "@/lib/api/reports";
import { paymentsApi } from "@/lib/api/payments";
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

type ReportFormat = "pdf" | "excel";

export type ReportExportType = "orders" | "payments" | "expenses";
export type ReportsWorkspaceTab = "overview" | "financial" | "operations" | "exports";

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

  const defaultRange = useMemo(() => getDefaultReportRange(), []);
  const [activeTab, setActiveTab] = useState<ReportsWorkspaceTab>("overview");

  const [preset, setPreset] = useState<ReportDatePreset>("30d");
  const [dateRange, setDateRange] = useState<DateRangeValue>(defaultRange);
  const [granularity, setGranularity] = useState<TrendGranularity>(
    resolveGranularityByRange(defaultRange),
  );

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [financialTrend, setFinancialTrend] = useState<FinancialTrend | null>(null);
  const [distributions, setDistributions] = useState<ReportDistributions | null>(null);
  const [productivity, setProductivity] = useState<ProductivityPoint[]>([]);

  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const [printingWeekly, setPrintingWeekly] = useState(false);

  const refreshAnalytics = useCallback(async () => {
    setLoading(true);

    try {
      const [summaryResponse, trendResponse, distributionsResponse, productivityResponse] =
        await Promise.all([
          reportsApi.getSummary(dateRange.from, dateRange.to),
          reportsApi.getFinancialTrend(dateRange.from, dateRange.to, granularity),
          reportsApi.getDistributions(dateRange.from, dateRange.to),
          reportsApi.getProductivityRange(dateRange.from, dateRange.to, 10),
        ]);

      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }

      if (trendResponse.success) {
        setFinancialTrend(trendResponse.data);
      }

      if (distributionsResponse.success) {
        setDistributions(distributionsResponse.data);
      }

      if (productivityResponse.success) {
        setProductivity(productivityResponse.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load report analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange.from, dateRange.to, granularity, toast]);

  useEffect(() => {
    void refreshAnalytics();
  }, [refreshAnalytics]);

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

        const blob = await reportsApi.exportReport(
          type,
          format,
          dateRange.from,
          dateRange.to,
        );

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
    [dateRange.from, dateRange.to, toast],
  );

  const printWeeklySummary = useCallback(async () => {
    setPrintingWeekly(true);

    try {
      toast({ title: "Generating Print View..." });
      const blob = await paymentsApi.getWeeklyReportPdf();
      triggerDownload(blob, "weekly_production_summary.pdf");
    } catch {
      toast({
        title: "Print Failed",
        description: "Failed to generate the print view.",
        variant: "destructive",
      });
    } finally {
      setPrintingWeekly(false);
    }
  }, [toast]);

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
