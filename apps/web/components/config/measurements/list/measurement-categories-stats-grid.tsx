import { Calculator, CheckCircle2, Filter, Ruler } from "lucide-react";
import { type MeasurementStats } from "@tbms/shared-types";
import { StatCard } from "@/components/ui/stat-card";

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
    <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Categories"
        subtitle="Measurement catalog"
        value={stats.totalCategories.toLocaleString()}
        tone="primary"
        icon={<Ruler className="h-4 w-4" />}
      />

      <StatCard
        title="Active Categories"
        subtitle="Visible in order forms"
        value={stats.activeCategories.toLocaleString()}
        tone="success"
        icon={<CheckCircle2 className="h-4 w-4" />}
      />

      <StatCard
        title="Total Fields"
        subtitle={`${stats.requiredFields.toLocaleString()} required`}
        value={stats.totalFields.toLocaleString()}
        tone="info"
        icon={<Calculator className="h-4 w-4" />}
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
