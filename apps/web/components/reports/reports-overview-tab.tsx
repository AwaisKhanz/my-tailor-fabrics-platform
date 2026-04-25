import { AlertTriangle, Banknote, ReceiptText, Wallet } from "lucide-react";
import type {
  FinancialTrend,
  ProductivityPoint,
  ReportDistributions,
  ReportSummary,
} from "@tbms/shared-types";
import { ReportsFinancialTrendChart } from "@/components/reports/reports-financial-trend-chart";
import { ReportsDistributionChart } from "@/components/reports/reports-distribution-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { RankedList } from "@tbms/ui/components/ranked-list";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { formatPKR } from "@/lib/utils";

interface ReportsOverviewTabProps {
  loading: boolean;
  summary: ReportSummary | null;
  financialTrend: FinancialTrend | null;
  distributions: ReportDistributions | null;
  productivity: ProductivityPoint[];
}

function getDeltaBadge(delta?: number): string {
  if (delta === undefined) {
    return "No comparison";
  }

  if (delta === 0) {
    return "Flat vs previous";
  }

  const abs = Math.abs(delta);
  const direction = delta > 0 ? "+" : "-";
  return `${direction}${formatPKR(abs)} vs previous`;
}

export function ReportsOverviewTab({
  loading,
  summary,
  financialTrend,
  distributions,
  productivity,
}: ReportsOverviewTabProps) {
  const netCurrent = summary?.net ?? 0;
  const netDeltaBadge = getDeltaBadge(summary?.netDelta);

  const revenueDeltaBadge = getDeltaBadge(summary?.revenueDelta);
  const expensesDeltaBadge = getDeltaBadge(summary?.expensesDelta);

  return (
    <div className="space-y-4">
      <StatsGrid columns="four">
        <StatCard
          title="Cash Collected"
          subtitle="Posted payments in selected period"
          value={formatPKR(summary?.revenue ?? 0)}
          helperText={revenueDeltaBadge}
          badgeText={`${summary?.totalOrders ?? 0} booked orders`}
          tone="success"
          icon={<Banknote className="h-4 w-4" />}
        />

        <StatCard
          title="Expenses"
          subtitle="Total period expenses"
          value={formatPKR(summary?.expenses ?? 0)}
          helperText={expensesDeltaBadge}
          badgeText={`${summary?.totalCustomers ?? 0} customers`}
          tone="destructive"
          icon={<ReceiptText className="h-4 w-4" />}
        />

        <StatCard
          title="Net"
          subtitle="Cash collected minus expenses"
          value={formatPKR(netCurrent)}
          helperText={netDeltaBadge}
          badgeText="Net cash"
          tone={netCurrent < 0 ? "destructive" : "info"}
          icon={<Wallet className="h-4 w-4" />}
        />

        <StatCard
          title="Overdue Orders"
          subtitle="Orders needing attention"
          value={(summary?.overdueCount ?? 0).toLocaleString()}
          helperText={`${summary?.newToday ?? 0} new today`}
          badgeText="Overdue"
          tone="warning"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </StatsGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <ReportsFinancialTrendChart
          loading={loading}
          trend={financialTrend}
          title="Financial Pulse"
          description="Cash collected, expenses, and net movement for the selected timeframe."
        />

        <div className="space-y-4">
          <ReportsDistributionChart
            loading={loading}
            title="Garment Mix"
            description="Non-cancelled booked invoice contribution across garment categories."
            points={distributions?.garments ?? []}
            mode="donut"
            valueFormatter={(value) => formatPKR(value)}
          />

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <RankedList
                loading={loading}
                emptyMessage="No productivity records for this range."
                items={productivity.slice(0, 5).map((entry) => ({
                  id: entry.employeeId,
                  label: entry.employeeName,
                  value: `${entry.totalCompleted} completed`,
                }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
