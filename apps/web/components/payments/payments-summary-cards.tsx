import { Banknote, CircleDollarSign, WalletCards } from "lucide-react";
import { type PaymentSummary } from "@tbms/shared-types";
import { Button } from "@tbms/ui/components/button";
import { Skeleton } from "@tbms/ui/components/skeleton";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { LoadingState } from "@tbms/ui/components/loading-state";
import { formatPKR } from "@/lib/utils";

interface PaymentsSummaryCardsProps {
  loading: boolean;
  summary: PaymentSummary | null;
  currentBalance: number;
  canDisburse: boolean;
  onDisburse: () => void;
  canManagePayments?: boolean;
}

export function PaymentsSummaryCards({
  loading,
  summary,
  currentBalance,
  canDisburse,
  onDisburse,
  canManagePayments = true,
}: PaymentsSummaryCardsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <LoadingState
          compact
          text="Loading payments..."
          caption="Preparing payout and balance summary."
        />
        <StatsGrid columns="three">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-28 rounded-xl" />
          ))}
        </StatsGrid>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <StatsGrid columns="three">
      <StatCard
        title="Total Earned"
        subtitle="Accrued earnings"
        value={formatPKR(summary.totalEarned)}
        badgeText="Earned"
        tone="success"
        icon={<CircleDollarSign className="h-4 w-4" />}
      />

      <StatCard
        title="Total Paid"
        subtitle="Settled payouts"
        value={formatPKR(summary.totalPaid)}
        badgeText="Settled"
        tone="info"
        icon={<WalletCards className="h-4 w-4" />}
      />

      <StatCard
        title="Outstanding Balance"
        subtitle="Current payable amount"
        value={formatPKR(currentBalance)}
        badgeText={currentBalance > 0 ? "Due" : "Clear"}
        tone={currentBalance > 0 ? "destructive" : "default"}
        icon={<Banknote className="h-4 w-4" />}
        action={
          canManagePayments ? (
            <Button
              variant={canDisburse ? "default" : "outline"}
              size="sm"
              onClick={onDisburse}
              disabled={!canDisburse}
            >
              Disburse Payment
            </Button>
          ) : null
        }
      />
    </StatsGrid>
  );
}
