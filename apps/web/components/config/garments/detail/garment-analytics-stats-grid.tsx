import { Activity, Banknote, ClipboardList, HandCoins } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { formatPKR } from "@/lib/utils";

interface GarmentAnalyticsStatsGridProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentAnalyticsStatsGrid({
  garment,
}: GarmentAnalyticsStatsGridProps) {
  return (
    <StatsGrid columns="four">
      <StatCard
        title="Total Orders"
        subtitle="Lifecycle volume"
        value={garment.analytics.totalOrders.toLocaleString()}
        tone="primary"
        icon={<ClipboardList className="h-4 w-4" />}
      />

      <StatCard
        title="Active Items"
        subtitle="Current production"
        value={garment.analytics.activeOrders.toLocaleString()}
        tone="warning"
        icon={<Activity className="h-4 w-4" />}
      />

      <StatCard
        title="Total Revenue"
        subtitle="Historical performance"
        value={formatPKR(garment.analytics.totalRevenue)}
        tone="success"
        icon={<Banknote className="h-4 w-4" />}
      />

      <StatCard
        title="Total Payout"
        subtitle="Tailor compensation"
        value={formatPKR(garment.analytics.totalPayout)}
        tone="info"
        icon={<HandCoins className="h-4 w-4" />}
      />
    </StatsGrid>
  );
}
