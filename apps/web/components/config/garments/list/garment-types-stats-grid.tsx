import { CheckCircle2, Filter, Package, Wallet } from "lucide-react";
import type { GarmentTypesStats } from "@/hooks/use-garment-types-page";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { formatPKR } from "@/lib/utils";

interface GarmentTypesStatsGridProps {
  stats: GarmentTypesStats;
  visibleCount: number;
  hasActiveFilters: boolean;
}

export function GarmentTypesStatsGrid({
  stats,
  visibleCount,
  hasActiveFilters,
}: GarmentTypesStatsGridProps) {
  const inactiveCount = Math.max(stats.totalCount - stats.activeProduction, 0);

  return (
    <StatsGrid columns="four">
      <StatCard
        title="Garment Types"
        subtitle="Global catalog"
        value={stats.totalCount.toLocaleString()}
        tone="primary"
        icon={<Package className="h-4 w-4" />}
      />

      <StatCard
        title="Active Types"
        subtitle="Available for production"
        value={stats.activeProduction.toLocaleString()}
        tone="success"
        icon={<CheckCircle2 className="h-4 w-4" />}
      />

      <StatCard
        title="Avg Retail Price"
        subtitle={`${inactiveCount.toLocaleString()} inactive type${inactiveCount === 1 ? "" : "s"}`}
        value={formatPKR(stats.avgRetailPrice)}
        tone="warning"
        icon={<Wallet className="h-4 w-4" />}
      />

      <StatCard
        title="Visible Results"
        subtitle={hasActiveFilters ? "Filtered listing" : "Default listing"}
        value={visibleCount.toLocaleString()}
        tone="info"
        icon={<Filter className="h-4 w-4" />}
      />
    </StatsGrid>
  );
}
