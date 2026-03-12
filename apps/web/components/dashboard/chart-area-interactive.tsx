"use client";

import * as React from "react";
import {
  InteractiveSalesChart,
  type InteractiveSalesChartRow,
} from "@tbms/ui/components/blocks/charts/interactive-sales-chart";
import { formatPKR } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export interface DashboardRevenueExpensesPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export function DashboardChartAreaInteractive({
  data,
  refreshing = false,
  onRefresh,
  onConfigure,
}: {
  data: DashboardRevenueExpensesPoint[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onConfigure?: () => void;
}) {
  const chartRows: InteractiveSalesChartRow[] = React.useMemo(
    () =>
      data.map((item) => ({
        label: item.month,
        revenue: item.revenue,
        expenses: item.expenses,
      })),
    [data],
  );

  const downloadText = React.useCallback((filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportCsv = React.useCallback(() => {
    const header = "Month,Revenue,Expenses";
    const rows = chartRows.map(
      (row) => `${row.label},${row.revenue},${row.expenses}`,
    );
    downloadText(
      "revenue-vs-expenses.csv",
      [header, ...rows].join("\n"),
    );
    toast({
      title: "CSV exported",
      description: "Revenue vs Expenses data was downloaded.",
      variant: "success",
    });
  }, [chartRows, downloadText]);

  const handleExportJson = React.useCallback(() => {
    downloadText(
      "revenue-vs-expenses.json",
      JSON.stringify(chartRows, null, 2),
    );
    toast({
      title: "JSON exported",
      description: "Revenue vs Expenses data was downloaded.",
      variant: "success",
    });
  }, [chartRows, downloadText]);

  const handleShare = React.useCallback(async () => {
    const latest = chartRows[chartRows.length - 1];
    if (!latest) {
      toast({
        title: "No chart data",
        description: "There is no data to share yet.",
        variant: "warning",
      });
      return;
    }

    const text = `${latest.label}: Revenue ${formatPKR(latest.revenue)}, Expenses ${formatPKR(latest.expenses)}.`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Revenue vs Expenses",
          text,
        });
        return;
      }

      if (!navigator.clipboard) {
        toast({
          title: "Share unavailable",
          description: "Clipboard access is not available in this browser.",
          variant: "warning",
        });
        return;
      }

      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Latest revenue/expenses summary is ready to paste.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Share failed",
        description: "Could not complete share action.",
        variant: "destructive",
      });
    }
  }, [chartRows]);

  return (
    <InteractiveSalesChart
      title="Revenue vs Expenses"
      description="Monthly financial movement for the selected period."
      data={chartRows}
      currencyFormatter={formatPKR}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      onExportCsv={handleExportCsv}
      onExportJson={handleExportJson}
      onShare={() => {
        void handleShare();
      }}
    />
  );
}
