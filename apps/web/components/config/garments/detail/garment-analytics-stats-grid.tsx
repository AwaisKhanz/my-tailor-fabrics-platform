import { Activity, Banknote, ClipboardList, HandCoins } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
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
        helperText="Historical garment order count"
        icon={<ClipboardList className="h-4 w-4" />}
        tone="info"
      />

      <StatCard
        title="Active Items"
        subtitle="Current production"
        value={garment.analytics.activeOrders.toLocaleString()}
        helperText="Open items in workflow"
        icon={<Activity className="h-4 w-4" />}
        tone="warning"
      />

      <StatCard
        title="Total Revenue"
        subtitle="Historical performance"
        value={formatPKR(garment.analytics.totalRevenue)}
        helperText="Customer revenue on this garment"
        icon={<Banknote className="h-4 w-4" />}
        tone="success"
      />

      <StatCard
        title="Total Payout"
        subtitle="Tailor compensation"
        value={formatPKR(garment.analytics.totalPayout)}
        helperText="Recorded labor disbursements"
        icon={<HandCoins className="h-4 w-4" />}
        tone="default"
      />
    </StatsGrid>
  );
}
