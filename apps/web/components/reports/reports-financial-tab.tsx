import { Banknote, ReceiptText, Scale } from "lucide-react";
import type { FinancialTrend } from "@tbms/shared-types";
import { ReportsFinancialTrendChart } from "@/components/reports/reports-financial-trend-chart";
import { StatCard } from "@/components/ui/stat-card";
import { formatPKR } from "@/lib/utils";

interface ReportsFinancialTabProps {
  loading: boolean;
  trend: FinancialTrend | null;
}

export function ReportsFinancialTab({ loading, trend }: ReportsFinancialTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Total Revenue"
          subtitle="In selected range"
          value={formatPKR(trend?.totals.revenue ?? 0)}
          tone="success"
          icon={<Banknote className="h-4 w-4" />}
        />

        <StatCard
          title="Total Expenses"
          subtitle="In selected range"
          value={formatPKR(trend?.totals.expenses ?? 0)}
          tone="destructive"
          icon={<ReceiptText className="h-4 w-4" />}
        />

        <StatCard
          title="Net Result"
          subtitle="Revenue - Expenses"
          value={formatPKR(trend?.totals.net ?? 0)}
          tone={(trend?.totals.net ?? 0) < 0 ? "destructive" : "primary"}
          icon={<Scale className="h-4 w-4" />}
        />
      </div>

      <ReportsFinancialTrendChart
        loading={loading}
        trend={trend}
        title="Revenue vs Expenses"
        description="Period trend with Revenue, Expenses, and Net overlay."
      />
    </div>
  );
}
