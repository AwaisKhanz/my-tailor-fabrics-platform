import { Filter, GitBranch, Globe2, Layers3 } from "lucide-react";
import { type RateStatsSummary } from "@tbms/shared-types";
import { StatCard } from "@/components/ui/stat-card";

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
    <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    </div>
  );
}
