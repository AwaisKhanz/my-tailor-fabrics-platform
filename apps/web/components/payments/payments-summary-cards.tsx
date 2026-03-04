import { Banknote, CircleDollarSign, WalletCards } from "lucide-react";
import { type PaymentSummary } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        title="Total Earned"
        subtitle="All lifecycle steps"
        value={formatPKR(summary.totalEarned)}
        tone="success"
        icon={<CircleDollarSign className="h-4 w-4" />}
      />

      <StatCard
        title="Total Paid"
        subtitle="Settled disbursements"
        value={formatPKR(summary.totalPaid)}
        tone="primary"
        icon={<WalletCards className="h-4 w-4" />}
      />

      <StatCard
        title="Outstanding Balance"
        subtitle="Payable amount"
        value={formatPKR(currentBalance)}
        tone="warning"
        icon={<Banknote className="h-4 w-4" />}
        badgeText={currentBalance > 0 ? "DUE" : "CLEAR"}
        valueClassName={currentBalance > 0 ? "" : "text-muted-foreground"}
        action={
          canManagePayments ? (
            <Button
              variant={canDisburse ? "premium" : "outline"}
              size="sm"
              className="w-full sm:w-auto"
              onClick={onDisburse}
              disabled={!canDisburse}
            >
              Disburse Payment
            </Button>
          ) : null
        }
      />
    </div>
  );
}
