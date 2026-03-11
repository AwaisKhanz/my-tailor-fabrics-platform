import { Calculator, CheckCircle2, Filter, Ruler } from "lucide-react";
import { type MeasurementStats } from "@tbms/shared-types";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";

interface MeasurementCategoriesStatsGridProps {
  stats: MeasurementStats;
  visibleOnPage: number;
  hasActiveFilters: boolean;
}

export function MeasurementCategoriesStatsGrid({
  stats,
  visibleOnPage,
  hasActiveFilters,
}: MeasurementCategoriesStatsGridProps) {
  return (
    <StatsGrid columns="four">
      <StatCard
        title="Categories"
        subtitle="Measurement catalog"
        value={stats.totalCategories.toLocaleString()}
        helperText="Configured category definitions"
        icon={<Ruler className="h-4 w-4" />}
      />

      <StatCard
        title="Active Categories"
        subtitle="Visible in order forms"
        value={stats.activeCategories.toLocaleString()}
        helperText="Available in active workflows"
        icon={<CheckCircle2 className="h-4 w-4" />}
        tone="success"
      />

      <StatCard
        title="Total Fields"
        subtitle={`${stats.requiredFields.toLocaleString()} required`}
        value={stats.totalFields.toLocaleString()}
        helperText="Category-level field definitions"
        icon={<Calculator className="h-4 w-4" />}
        tone="info"
      />

      <StatCard
        title="Visible Rows"
        subtitle={hasActiveFilters ? "Filtered listing" : "Default listing"}
        value={visibleOnPage.toLocaleString()}
        helperText={hasActiveFilters ? "Filters applied" : "Unfiltered listing"}
        icon={<Filter className="h-4 w-4" />}
        tone={hasActiveFilters ? "warning" : "default"}
      />
    </StatsGrid>
  );
}
