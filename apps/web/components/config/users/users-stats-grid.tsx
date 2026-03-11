import { ShieldAlert, Monitor, UserCheck } from "lucide-react";
import { type UserStatsSummary } from "@tbms/shared-types";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";

interface UsersStatsGridProps {
  stats: UserStatsSummary;
}

export function UsersStatsGrid({ stats }: UsersStatsGridProps) {
  return (
    <StatsGrid columns="threeMd">
      <StatCard
        title="Active Accounts"
        subtitle="User availability"
        value={stats.active}
        helperText="Access ready"
        icon={<UserCheck className="h-4 w-4" />}
        tone="success"
      />

      <StatCard
        title="Privileged Roles"
        subtitle="Admins and operators"
        value={`${stats.privileged} users`}
        helperText="Elevated access holders"
        icon={<ShieldAlert className="h-4 w-4" />}
        tone="warning"
      />

      <StatCard
        title="System Health"
        subtitle="Live access control"
        value="100%"
        helperText="Authorization services healthy"
        icon={<Monitor className="h-4 w-4" />}
        tone="info"
      />
    </StatsGrid>
  );
}
