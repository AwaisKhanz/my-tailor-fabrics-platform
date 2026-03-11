import { Layers3, Save, Workflow } from "lucide-react";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";

interface SystemSettingsStatsGridProps {
  workflowEnabled: boolean;
  dirty: boolean;
}

export function SystemSettingsStatsGrid({
  workflowEnabled,
  dirty,
}: SystemSettingsStatsGridProps) {
  return (
    <StatsGrid columns="threeMd">
      <StatCard
        title="Workflow State"
        subtitle="Task engine"
        value={workflowEnabled ? "Active" : "Inactive"}
        helperText="Global order task pipeline"
        icon={<Workflow className="h-4 w-4" />}
        tone={workflowEnabled ? "success" : "warning"}
      />
      <StatCard
        title="Change State"
        subtitle="Draft status"
        value={dirty ? "Pending" : "Synced"}
        helperText="Unsaved settings snapshot"
        icon={<Save className="h-4 w-4" />}
        tone={dirty ? "warning" : "success"}
      />
      <StatCard
        title="Managed Controls"
        subtitle="Global scope"
        value="1"
        helperText="Primary operational toggle"
        icon={<Layers3 className="h-4 w-4" />}
        tone="info"
      />
    </StatsGrid>
  );
}
