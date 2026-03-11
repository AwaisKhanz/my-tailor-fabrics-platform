import {
  Activity,
  History,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";
import type { AuditLogsStats } from "@tbms/shared-types";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";

interface AuditLogsStatsGridProps {
  stats: AuditLogsStats;
}

export function AuditLogsStatsGrid({ stats }: AuditLogsStatsGridProps) {
  return (
    <StatsGrid columns="three">
      <StatCard
        title="Total Events"
        subtitle="Matching filters"
        value={stats.total.toLocaleString()}
        tone="primary"
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        title="Unique Users"
        subtitle="Active actors"
        value={stats.uniqueUsers.toLocaleString()}
        tone="info"
        icon={<UserCheck className="h-4 w-4" />}
      />
      <StatCard
        title="Create Events"
        subtitle="Write operations"
        value={stats.createCount.toLocaleString()}
        tone="success"
        icon={<ShieldCheck className="h-4 w-4" />}
      />
      <StatCard
        title="Update Events"
        subtitle="Modified records"
        value={stats.updateCount.toLocaleString()}
        tone="warning"
        icon={<History className="h-4 w-4" />}
      />
      <StatCard
        title="Delete Events"
        subtitle="Destructive operations"
        value={stats.deleteCount.toLocaleString()}
        tone="destructive"
        icon={<Trash2 className="h-4 w-4" />}
      />
      <StatCard
        title="Login Events"
        subtitle="Access activity"
        value={stats.loginCount.toLocaleString()}
        tone="default"
        icon={<UserCheck className="h-4 w-4" />}
      />
    </StatsGrid>
  );
}
