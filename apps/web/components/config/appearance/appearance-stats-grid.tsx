import { MonitorCog, Palette, Sparkles } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface AppearanceStatsGridProps {
  modeLabel: string;
  activePreset: string;
  totalPresets: number;
}

export function AppearanceStatsGrid({
  modeLabel,
  activePreset,
  totalPresets,
}: AppearanceStatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Workspace Mode"
        subtitle="active rendering"
        value={modeLabel}
        tone="info"
        icon={<MonitorCog className="h-4 w-4" />}
      />
      <StatCard
        title="Theme Preset"
        subtitle="current palette"
        value={activePreset}
        tone="primary"
        icon={<Palette className="h-4 w-4" />}
      />
      <StatCard
        title="Available Presets"
        subtitle="selectable themes"
        value={totalPresets.toString()}
        tone="success"
        icon={<Sparkles className="h-4 w-4" />}
      />
    </div>
  );
}
