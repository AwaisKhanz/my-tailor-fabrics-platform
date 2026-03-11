import { Banknote, ReceiptText, Scale } from "lucide-react";
import type { FinancialTrend } from "@tbms/shared-types";
import { ReportsFinancialTrendChart } from "@/components/reports/reports-financial-trend-chart";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { formatPKR } from "@/lib/utils";

interface ReportsFinancialTabProps {
  loading: boolean;
  trend: FinancialTrend | null;
}

export function ReportsFinancialTab({ loading, trend }: ReportsFinancialTabProps) {
  return (
    <div className="space-y-4">
      <StatsGrid columns="threeMd">
        <StatCard
          title="Total Revenue"
          subtitle="Range aggregate"
          value={formatPKR(trend?.totals.revenue ?? 0)}
          badgeText="Revenue"
          tone="success"
          icon={<Banknote className="h-4 w-4" />}
        />
        <StatCard
          title="Total Expenses"
          subtitle="Range aggregate"
          value={formatPKR(trend?.totals.expenses ?? 0)}
          badgeText="Expenses"
          tone="destructive"
          icon={<ReceiptText className="h-4 w-4" />}
        />
        <StatCard
          title="Net Result"
          subtitle="Revenue minus expenses"
          value={formatPKR(trend?.totals.net ?? 0)}
          badgeText="Net"
          tone={(trend?.totals.net ?? 0) < 0 ? "destructive" : "info"}
          icon={<Scale className="h-4 w-4" />}
        />
      </StatsGrid>

      <ReportsFinancialTrendChart
        loading={loading}
        trend={trend}
        title="Revenue vs Expenses"
        description="Period trend with Revenue, Expenses, and Net overlay."
      />
    </div>
  );
}
