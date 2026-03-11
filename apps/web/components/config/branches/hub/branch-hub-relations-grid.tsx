import { Activity, Briefcase, Building2, Users } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";

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
        tone="primary"
        icon={<Users className="h-4 w-4" />}
      />

      <StatCard
        title="Customers"
        subtitle={`Active / ${(branch?._count?.customers || 0).toLocaleString()} total`}
        value={(branch?.stats?.activeCustomers || 0).toLocaleString()}
        tone="info"
        icon={<Users className="h-4 w-4" />}
      />

      <StatCard
        title="Open Orders"
        subtitle={`Completed: ${(branch?.stats?.completedOrders || 0).toLocaleString()}`}
        value={(branch?.stats?.openOrders || 0).toLocaleString()}
        tone="warning"
        icon={<Briefcase className="h-4 w-4" />}
      />

      <StatCard
        title="Garment Catalog"
        subtitle={`Code: ${(branch?.code || "N/A").toUpperCase()}`}
        value={(branch?.stats?.totalGarments || 0).toLocaleString()}
        tone={isActive ? "success" : "destructive"}
        icon={
          isActive ? (
            <Activity className="h-4 w-4" />
          ) : (
            <Building2 className="h-4 w-4" />
          )
        }
      />
    </StatsGrid>
  );
}
