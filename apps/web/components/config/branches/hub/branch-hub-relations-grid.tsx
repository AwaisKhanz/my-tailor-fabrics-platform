import { Activity, Briefcase, Building2, Users } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";

interface BranchHubRelationsGridProps {
  branch: BranchDetail | null;
}

export function BranchHubRelationsGrid({
  branch,
}: BranchHubRelationsGridProps) {
  const isActive = Boolean(branch?.isActive);

  return (
    <StatsGrid columns="four">
      <StatCard
        title="Employees"
        subtitle={`Active / ${(branch?._count?.employees || 0).toLocaleString()} total`}
        value={(branch?.stats?.activeEmployees || 0).toLocaleString()}
        helperText="Team members assigned to this branch"
        icon={<Users className="h-4 w-4" />}
        tone="info"
      />

      <StatCard
        title="Customers"
        subtitle={`Active / ${(branch?._count?.customers || 0).toLocaleString()} total`}
        value={(branch?.stats?.activeCustomers || 0).toLocaleString()}
        helperText="Customer accounts linked to this branch"
        icon={<Users className="h-4 w-4" />}
        tone="success"
      />

      <StatCard
        title="Open Orders"
        subtitle={`Completed: ${(branch?.stats?.completedOrders || 0).toLocaleString()}`}
        value={(branch?.stats?.openOrders || 0).toLocaleString()}
        helperText="In-progress production workload"
        icon={<Briefcase className="h-4 w-4" />}
        tone="warning"
      />

      <StatCard
        title="Garment Catalog"
        subtitle={`Code: ${(branch?.code || "N/A").toUpperCase()}`}
        value={(branch?.stats?.totalGarments || 0).toLocaleString()}
        helperText="Garment types available in this branch"
        icon={
          isActive ? (
            <Activity className="h-4 w-4" />
          ) : (
            <Building2 className="h-4 w-4" />
          )
        }
        tone={isActive ? "success" : "default"}
      />
    </StatsGrid>
  );
}
