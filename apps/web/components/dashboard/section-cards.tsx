import { TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton } from "@tbms/ui/components/skeleton";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { LoadingState } from "@tbms/ui/components/loading-state";
import type { DashboardStats } from "@tbms/shared-types";
import { formatPKR } from "@/lib/utils";

interface DashboardSectionCardsProps {
  loading: boolean;
  stats: DashboardStats | null;
}

function Value({ loading, value }: { loading: boolean; value: string }) {
  if (loading) {
    return <Skeleton className="h-4 w-28 mt-2" />;
  }

  return value;
}

export function DashboardSectionCards({
  loading,
  stats,
}: DashboardSectionCardsProps) {
  const revenue = formatPKR(stats?.revenue ?? 0);
  const expenses = formatPKR(stats?.expenses ?? 0);
  const outstanding = formatPKR(stats?.outstandingBalances ?? 0);
  const newToday = String(stats?.newToday ?? 0);

  return (
    <div className="">
      {loading ? (
        <LoadingState
          compact
          text="Loading dashboard..."
          caption="Syncing key business metrics."
          className="mb-3"
        />
      ) : null}
      <StatsGrid columns="four">
        <StatCard
          title="Cash Collected"
          subtitle="Confirmed payments"
          value={<Value loading={loading} value={revenue} />}
          helperText="Posted order payments received"
          badgeText="Live"
          tone="success"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Total Expenses"
          subtitle="Operational spend"
          value={<Value loading={loading} value={expenses} />}
          helperText="Branch-adjusted expenses"
          badgeText="Tracked"
          tone="warning"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <StatCard
          title="Outstanding Receivables"
          subtitle="Pending customer collections"
          value={<Value loading={loading} value={outstanding} />}
          helperText="Unpaid balance across non-cancelled orders"
          badgeText="Follow-up"
          tone="destructive"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <StatCard
          title="New Today"
          subtitle="Orders opened today"
          value={<Value loading={loading} value={newToday} />}
          helperText="Based on current branch scope"
          badgeText="Orders"
          tone="info"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </StatsGrid>
    </div>
  );
}
