import {
  CheckCircle2,
  ListChecks,
  SlidersHorizontal,
  Type,
} from "lucide-react";
import { type MeasurementField } from "@tbms/shared-types";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";

interface MeasurementFieldsStatsGridProps {
  fields: MeasurementField[];
}

export function MeasurementFieldsStatsGrid({
  fields,
}: MeasurementFieldsStatsGridProps) {
  const required = fields.filter((field) => field.isRequired).length;
  const optional = Math.max(fields.length - required, 0);
  const dropdownFields = fields.filter(
    (field) => field.fieldType === "DROPDOWN",
  ).length;

  return (
    <StatsGrid columns="four">
      <StatCard
        title="Fields"
        subtitle="Category definitions"
        value={fields.length.toLocaleString()}
        helperText="Total configured measurement inputs"
        icon={<ListChecks className="h-4 w-4" />}
        tone="info"
      />

      <StatCard
        title="Required"
        subtitle="Mandatory in forms"
        value={required.toLocaleString()}
        helperText="Must be filled in measurement flow"
        icon={<CheckCircle2 className="h-4 w-4" />}
        tone="success"
      />

      <StatCard
        title="Optional"
        subtitle="Optional input fields"
        value={optional.toLocaleString()}
        helperText="Supplementary measurements"
        icon={<Type className="h-4 w-4" />}
        tone="default"
      />

      <StatCard
        title="Dropdown Fields"
        subtitle="Controlled options"
        value={dropdownFields.toLocaleString()}
        helperText="Fields using predefined option sets"
        icon={<SlidersHorizontal className="h-4 w-4" />}
        tone="warning"
      />
    </StatsGrid>
  );
}
