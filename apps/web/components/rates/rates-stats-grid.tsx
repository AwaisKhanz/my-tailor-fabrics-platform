import { Filter, GitBranch, Globe2, Layers3 } from "lucide-react";
import { type RateStatsSummary } from "@tbms/shared-types";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";

interface RatesStatsGridProps {
  stats: RateStatsSummary;
  visibleOnPage: number;
  hasActiveFilters: boolean;
}

export function RatesStatsGrid({
  stats,
  visibleOnPage,
  hasActiveFilters,
}: RatesStatsGridProps) {
  return (
    <StatsGrid columns="four">
      <StatCard
        title="Rate Cards"
        subtitle="Matching current query"
        value={stats.total.toLocaleString()}
        tone="primary"
        icon={<Layers3 className="h-4 w-4" />}
      />

      <StatCard
        title="Global Rates"
        subtitle="Default fallback rates"
        value={stats.global.toLocaleString()}
        tone="info"
        icon={<Globe2 className="h-4 w-4" />}
      />

      <StatCard
        title="Branch Scoped"
        subtitle="Branch-specific overrides"
        value={stats.branchScoped.toLocaleString()}
        tone="success"
        icon={<GitBranch className="h-4 w-4" />}
      />

      <StatCard
        title="Visible Rows"
        subtitle={hasActiveFilters ? "Filtered listing" : "Default listing"}
        value={visibleOnPage.toLocaleString()}
        tone="warning"
        icon={<Filter className="h-4 w-4" />}
      />
    </StatsGrid>
  );
}
