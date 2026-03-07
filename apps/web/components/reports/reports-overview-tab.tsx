import { AlertTriangle, Banknote, ReceiptText, Wallet } from "lucide-react";
import type {
  FinancialTrend,
  ProductivityPoint,
  ReportDistributions,
  ReportSummary,
} from "@tbms/shared-types";
import { ReportsFinancialTrendChart } from "@/components/reports/reports-financial-trend-chart";
import { ReportsDistributionChart } from "@/components/reports/reports-distribution-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { StatCard } from "@/components/ui/stat-card";
import { formatPKR } from "@/lib/utils";

interface ReportsOverviewTabProps {
  loading: boolean;
  summary: ReportSummary | null;
  financialTrend: FinancialTrend | null;
  distributions: ReportDistributions | null;
  productivity: ProductivityPoint[];
}

function getDeltaBadge(delta?: number): {
  label: string;
  variant: "success" | "destructive" | "outline";
} {
  if (delta === undefined) {
    return { label: "No comparison", variant: "outline" };
  }

  if (delta === 0) {
    return { label: "Flat vs previous", variant: "outline" };
  }

  const abs = Math.abs(delta);
  const direction = delta > 0 ? "+" : "-";
  const label = `${direction}${formatPKR(abs)} vs previous`;

  return {
    label,
    variant: delta > 0 ? "success" : "destructive",
  };
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
      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Revenue"
          subtitle="Selected period"
          value={formatPKR(summary?.revenue ?? 0)}
          helperText={`${summary?.totalOrders ?? 0} orders in period`}
          tone="success"
          icon={<Banknote className="h-4 w-4" />}
          badgeText={
            revenueDeltaBadge.variant === "outline"
              ? undefined
              : revenueDeltaBadge.label
          }
        />

        <StatCard
          title="Expenses"
          subtitle="Selected period"
          value={formatPKR(summary?.expenses ?? 0)}
          helperText={`${summary?.totalCustomers ?? 0} tracked customers`}
          tone="destructive"
          icon={<ReceiptText className="h-4 w-4" />}
          badgeText={
            expensesDeltaBadge.variant === "outline"
              ? undefined
              : expensesDeltaBadge.label
          }
        />

        <StatCard
          title="Net"
          subtitle="Revenue minus expenses"
          value={formatPKR(netCurrent)}
          helperText={netDeltaBadge.label}
          tone={netCurrent < 0 ? "destructive" : "primary"}
          icon={<Wallet className="h-4 w-4" />}
        />

        <StatCard
          title="Overdue Orders"
          subtitle="Needs attention"
          value={summary?.overdueCount ?? 0}
          helperText={`${summary?.newToday ?? 0} new today`}
          tone="warning"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <ReportsFinancialTrendChart
          loading={loading}
          trend={financialTrend}
          title="Financial Pulse"
          description="Revenue, expense, and net movement for the selected timeframe."
        />

        <div className="space-y-4">
          <ReportsDistributionChart
            loading={loading}
            title="Garment Mix"
            description="Contribution split across garment categories."
            points={distributions?.garments ?? []}
            mode="donut"
            valueFormatter={(value) => formatPKR(value)}
          />

          <Card>
            <CardHeader layout="rowBetween" surface="mutedSection" trimBottom>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent spacing="section" className="space-y-2">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-8 animate-pulse rounded bg-muted"
                  />
                ))
              ) : productivity.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No productivity records for this range.
                </p>
              ) : (
                productivity.slice(0, 5).map((entry, index) => (
                  <InfoTile
                    key={entry.employeeId}
                    tone="secondary"
                    padding="md"
                    layout="between"
                    interaction="interactive"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="xs">
                        #{index + 1}
                      </Badge>
                      <span className="text-sm text-foreground">
                        {entry.employeeName}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {entry.totalCompleted} completed
                    </span>
                  </InfoTile>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
