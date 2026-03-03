import { Banknote, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { formatPKR } from "@/lib/utils";

interface EmployeeFinancialCardsProps {
  stats: {
    totalEarned: number;
    totalPaid: number;
    currentBalance: number;
  };
}

export function EmployeeFinancialCards({ stats }: EmployeeFinancialCardsProps) {
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Lifetime Earned"
        subtitle="Total generated payouts"
        value={formatPKR(stats.totalEarned)}
        tone="primary"
        icon={<Banknote className="h-4 w-4" />}
      />

      <StatCard
        title="Total Paid Out"
        subtitle="Settled disbursements"
        value={formatPKR(stats.totalPaid)}
        tone="success"
        icon={<CheckCircle2 className="h-4 w-4" />}
      />

      <StatCard
        title="Current Balance"
        subtitle="Remaining payable amount"
        value={formatPKR(stats.currentBalance)}
        tone="warning"
        icon={<Banknote className="h-4 w-4" />}
        className="sm:col-span-2 xl:col-span-1"
      />
    </div>
  );
}
