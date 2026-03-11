import { Filter, ReceiptText, Wallet } from "lucide-react";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { formatPKR } from "@/lib/utils";

interface ExpensesOverviewCardsProps {
  listedAmount: number;
  listedCount: number;
  totalCount: number;
  activeFilterCount: number;
}

export function ExpensesOverviewCards({
  listedAmount,
  listedCount,
  totalCount,
  activeFilterCount,
}: ExpensesOverviewCardsProps) {
  return (
    <StatsGrid columns="three">
      <StatCard
        title="Page Spend"
        subtitle="Visible expense amount"
        value={formatPKR(listedAmount)}
        badgeText="Visible"
        tone="destructive"
        icon={<Wallet className="h-4 w-4" />}
      />

      <StatCard
        title="Records"
        subtitle="Rows on current page"
        value={listedCount.toLocaleString()}
        helperText={`of ${totalCount.toLocaleString()} total expenses`}
        tone="info"
        icon={<ReceiptText className="h-4 w-4" />}
      />

      <StatCard
        title="Filters"
        subtitle="Current query state"
        value={activeFilterCount.toLocaleString()}
        badgeText={activeFilterCount > 0 ? "Active" : "Clear"}
        tone={activeFilterCount > 0 ? "warning" : "default"}
        icon={<Filter className="h-4 w-4" />}
      />
    </StatsGrid>
  );
}
