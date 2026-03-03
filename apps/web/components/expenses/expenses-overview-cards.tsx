import { Filter, ReceiptText, Wallet } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
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
    <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Page Spend"
        subtitle="Visible records only"
        value={formatPKR(listedAmount)}
        tone="destructive"
        icon={<Wallet className="h-4 w-4" />}
      />

      <StatCard
        title="Records"
        subtitle="Current page / total"
        value={listedCount}
        helperText={`of ${totalCount} total matching records`}
        tone="primary"
        icon={<ReceiptText className="h-4 w-4" />}
      />

      <StatCard
        title="Filters"
        subtitle="Active query state"
        value={activeFilterCount}
        helperText="Applied on ledger listing"
        badgeText={activeFilterCount > 0 ? "ACTIVE" : "CLEAR"}
        tone="info"
        icon={<Filter className="h-4 w-4" />}
        className="sm:col-span-2 xl:col-span-1"
      />
    </div>
  );
}
