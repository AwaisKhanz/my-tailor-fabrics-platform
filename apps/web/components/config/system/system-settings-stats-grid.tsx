import { Layers3, Save, Workflow } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface SystemSettingsStatsGridProps {
  workflowEnabled: boolean;
  dirty: boolean;
}

export function SystemSettingsStatsGrid({
  workflowEnabled,
  dirty,
}: SystemSettingsStatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Workflow State"
        subtitle="task engine"
        value={workflowEnabled ? "Active" : "Inactive"}
        tone={workflowEnabled ? "success" : "warning"}
        icon={<Workflow className="h-4 w-4" />}
      />
      <StatCard
        title="Change State"
        subtitle="draft status"
        value={dirty ? "Pending" : "Synced"}
        tone={dirty ? "warning" : "info"}
        icon={<Save className="h-4 w-4" />}
      />
      <StatCard
        title="Managed Controls"
        subtitle="global scope"
        value="1"
        tone="primary"
        icon={<Layers3 className="h-4 w-4" />}
      />
    </div>
  );
}
