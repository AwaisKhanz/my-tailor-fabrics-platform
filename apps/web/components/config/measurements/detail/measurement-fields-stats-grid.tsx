import { CheckCircle2, ListChecks, SlidersHorizontal, Type } from "lucide-react";
import { type MeasurementField } from "@tbms/shared-types";
import { StatCard } from "@/components/ui/stat-card";

interface MeasurementFieldsStatsGridProps {
  fields: MeasurementField[];
}

export function MeasurementFieldsStatsGrid({ fields }: MeasurementFieldsStatsGridProps) {
  const required = fields.filter((field) => field.isRequired).length;
  const optional = Math.max(fields.length - required, 0);
  const dropdownFields = fields.filter((field) => field.fieldType === "DROPDOWN").length;

  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Fields"
        subtitle="Category definitions"
        value={fields.length.toLocaleString()}
        tone="primary"
        icon={<ListChecks className="h-4 w-4" />}
      />

      <StatCard
        title="Required"
        subtitle="Mandatory in forms"
        value={required.toLocaleString()}
        tone="success"
        icon={<CheckCircle2 className="h-4 w-4" />}
      />

      <StatCard
        title="Optional"
        subtitle="Optional input fields"
        value={optional.toLocaleString()}
        tone="warning"
        icon={<Type className="h-4 w-4" />}
      />

      <StatCard
        title="Dropdown Fields"
        subtitle="Controlled options"
        value={dropdownFields.toLocaleString()}
        tone="info"
        icon={<SlidersHorizontal className="h-4 w-4" />}
      />
    </div>
  );
}
