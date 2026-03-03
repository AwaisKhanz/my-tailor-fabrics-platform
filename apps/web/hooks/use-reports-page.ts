"use client";

import { useCallback, useEffect, useState } from "react";
import { reportsApi, type ReportSummary } from "@/lib/api/reports";
import { paymentsApi } from "@/lib/api/payments";
import { useToast } from "@/hooks/use-toast";

type ReportFormat = "pdf" | "excel";
export type ReportExportType = "orders" | "payments" | "expenses";

interface DateRangeState {
  from: string;
  to: string;
}

function getDefaultDateRange(): DateRangeState {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 30);

  return {
    from: from.toISOString().split("T")[0] ?? "",
    to: today.toISOString().split("T")[0] ?? "",
  };
}

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

export function useReportsPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeState>(getDefaultDateRange);

  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const [printingWeekly, setPrintingWeekly] = useState(false);

  const refreshAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportsApi.getSummary(dateRange.from, dateRange.to);
      if (response.success) {
        setSummary(response.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange.from, dateRange.to, toast]);

  useEffect(() => {
    void refreshAnalytics();
  }, [refreshAnalytics]);

  const setDateRangeValue = useCallback(
    (field: keyof DateRangeState, value: string) => {
      setDateRange((previous) => ({ ...previous, [field]: value }));
    },
    [],
  );

  const exportReport = useCallback(
    async (type: ReportExportType, format: ReportFormat) => {
      const key = `${type}:${format}`;
      setExportingKey(key);

      try {
        toast({
          title: `Generating ${type} ${format.toUpperCase()}...`,
        });

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
    loading,
    summary,
    dateRange,
    exportingKey,
    printingWeekly,
    setDateRangeValue,
    refreshAnalytics,
    exportReport,
    printWeeklySummary,
  };
}
