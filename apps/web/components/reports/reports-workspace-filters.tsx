import type { TrendGranularity } from "@tbms/shared-types";
import { CalendarRange } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const GRANULARITY_OPTIONS: Array<{ value: TrendGranularity; label: string }> = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

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
    <Card variant="elevatedPanel">
      <CardContent className="space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:min-w-[440px]">
            <div className="space-y-1.5">
              <Label variant="dashboard">Date Range</Label>
              <Select
                value={preset}
                onValueChange={(value) => {
                  if (isReportDatePreset(value)) {
                    onPresetChange(value);
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger variant="table" className="h-9">
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
              <Label variant="dashboard">Granularity</Label>
              <Select
                value={granularity}
                onValueChange={(value) => {
                  if (isTrendGranularity(value)) {
                    onGranularityChange(value);
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger variant="table" className="h-9">
                  <SelectValue placeholder="Select granularity" />
                </SelectTrigger>
                <SelectContent>
                  {GRANULARITY_OPTIONS.map((option) => (
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
              tone="elevatedSoft"
              layout="row"
              padding="md"
              className="h-9 rounded-md text-xs text-text-secondary lg:w-fit"
            >
              <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
              {rangeLabel}
            </InfoTile>
          )}
        </div>

        {preset === "custom" ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:ml-auto lg:max-w-[440px]">
            <div className="space-y-1.5">
              <Label variant="dashboard" className="sr-only">
                Start Date
              </Label>
              <Input
                variant="table"
                type="date"
                value={dateRange.from}
                onChange={(event) => onDateChange("from", event.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label variant="dashboard" className="sr-only">
                End Date
              </Label>
              <Input
                variant="table"
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
