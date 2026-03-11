import { Brush, Filter, GitBranch, Shirt } from "lucide-react";
import { type DesignType } from "@tbms/shared-types";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";

interface DesignTypesStatsGridProps {
  designTypes: DesignType[];
  hasActiveFilters: boolean;
}

export function DesignTypesStatsGrid({
  designTypes,
  hasActiveFilters,
}: DesignTypesStatsGridProps) {
  const globalTypes = designTypes.filter(
    (designType) => !designType.branchId,
  ).length;
  const branchScoped = designTypes.length - globalTypes;
  const activeTypes = designTypes.filter(
    (designType) => designType.isActive,
  ).length;

  return (
    <StatsGrid columns="four">
      <StatCard
        title="Design Types"
        subtitle="Catalog entries"
        value={designTypes.length.toLocaleString()}
        tone="primary"
        icon={<Brush className="h-4 w-4" />}
      />

      <StatCard
        title="Global Types"
        subtitle="Branch-agnostic"
        value={globalTypes.toLocaleString()}
        tone="info"
        icon={<Shirt className="h-4 w-4" />}
      />

      <StatCard
        title="Branch Scoped"
        subtitle="Branch-specific designs"
        value={branchScoped.toLocaleString()}
        tone="success"
        icon={<GitBranch className="h-4 w-4" />}
      />

      <StatCard
        title="Active"
        subtitle={hasActiveFilters ? "Filtered listing" : "All available types"}
        value={activeTypes.toLocaleString()}
        tone="warning"
        icon={<Filter className="h-4 w-4" />}
      />
    </StatsGrid>
  );
}
