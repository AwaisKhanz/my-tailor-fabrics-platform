"use client";

import {
  InteractiveSalesChart,
  type InteractiveSalesChartRow,
} from "@tbms/ui/components/blocks/charts/interactive-sales-chart";
import { formatPKR } from "@/lib/utils";

export interface DashboardRevenueExpensesPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export function DashboardChartAreaInteractive({
  data,
}: {
  data: DashboardRevenueExpensesPoint[];
}) {
  const chartRows: InteractiveSalesChartRow[] = data.map((item) => ({
    label: item.month,
    revenue: item.revenue,
    expenses: item.expenses,
  }));

  return (
    <InteractiveSalesChart
      title="Revenue vs Expenses"
      description="Monthly financial movement for the selected period."
      data={chartRows}
      currencyFormatter={formatPKR}
    />
  );
}
