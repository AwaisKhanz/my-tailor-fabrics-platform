import { Banknote, CheckCircle2, ClipboardList } from "lucide-react";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { formatPKR } from "@/lib/utils";

interface EmployeeFinancialCardsProps {
  stats: {
    totalEarned: number;
    totalPaid: number;
    currentBalance: number;
  };
  activeTaskCount?: number;
}

export function EmployeeFinancialCards({
  stats,
  activeTaskCount = 0,
}: EmployeeFinancialCardsProps) {
  return (
    <StatsGrid columns="four">
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
      />

      <StatCard
        title="Active Tasks"
        subtitle="Open work items needing attention"
        value={String(activeTaskCount)}
        tone="info"
        icon={<ClipboardList className="h-4 w-4" />}
      />
    </StatsGrid>
  );
}
