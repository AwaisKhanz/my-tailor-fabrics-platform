import type { TrendGranularity } from "@tbms/shared-types";
import { CalendarRange } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  isReportDatePreset,
  isTrendGranularity,
  type DateRangeValue,
  type ReportDatePreset,
  TREND_GRANULARITY_OPTIONS,
} from "@/lib/reports-date";

interface ReportsWorkspaceFiltersProps {
  preset: ReportDatePreset;
  presetOptions: Array<{ value: ReportDatePreset; label: string }>;
  dateRange: DateRangeValue;
  granularity: TrendGranularity;
  loading: boolean;
  onPresetChange: (preset: ReportDatePreset) => void;
  onDateChange: (field: keyof DateRangeValue, value: string) => void;
  onGranularityChange: (value: TrendGranularity) => void;
}

export function ReportsWorkspaceFilters({
  preset,
  presetOptions,
  dateRange,
  granularity,
  loading,
  onPresetChange,
  onDateChange,
  onGranularityChange,
}: ReportsWorkspaceFiltersProps) {
  const rangeLabel = `${new Date(dateRange.from).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} to ${new Date(dateRange.to).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:min-w-[440px]">
            <div className="space-y-1.5">
              <FieldLabel>Date Range</FieldLabel>
              <Select
                value={preset}
                onValueChange={(value) => {
                  if (isReportDatePreset(value)) {
                    onPresetChange(value);
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {presetOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Granularity</FieldLabel>
              <Select
                value={granularity}
                onValueChange={(value) => {
                  if (isTrendGranularity(value)) {
                    onGranularityChange(value);
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select granularity" />
                </SelectTrigger>
                <SelectContent>
                  {TREND_GRANULARITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {preset === "custom" ? null : (
            <InfoTile
              tone="secondary"
              layout="row"
              padding="md"
              className="h-9 rounded-md text-xs text-muted-foreground lg:w-fit"
            >
              <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
              {rangeLabel}
            </InfoTile>
          )}
        </div>

        {preset === "custom" ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:ml-auto lg:max-w-[440px]">
            <div className="space-y-1.5">
              <FieldLabel className="sr-only">Start Date</FieldLabel>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(event) => onDateChange("from", event.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel className="sr-only">End Date</FieldLabel>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(event) => onDateChange("to", event.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
