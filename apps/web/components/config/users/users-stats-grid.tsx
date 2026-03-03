import { ShieldAlert, Monitor, UserCheck } from "lucide-react";
import { type UserStatsSummary } from "@tbms/shared-types";
import { StatCard } from "@/components/ui/stat-card";

interface UsersStatsGridProps {
  stats: UserStatsSummary;
}

export function UsersStatsGrid({ stats }: UsersStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
      <StatCard
        title="Active Accounts"
        subtitle="User availability"
        value={stats.active}
        badgeText="Secure"
        helperText="Access ready"
        tone="success"
        icon={<UserCheck className="h-4 w-4" />}
      />

      <StatCard
        title="Privileged Roles"
        subtitle="Admins & operators"
        value={`${stats.privileged} Users`}
        helperText="Elevated access holders"
        tone="warning"
        icon={<ShieldAlert className="h-4 w-4" />}
      />

      <StatCard
        title="System Health"
        subtitle="Live access control"
        value="100%"
        helperText="Authorization services healthy"
        tone="primary"
        icon={<Monitor className="h-4 w-4" />}
      />
    </div>
  );
}
