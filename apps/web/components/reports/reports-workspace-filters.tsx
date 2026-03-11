import type { TrendGranularity } from "@tbms/shared-types";
import { CalendarRange } from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import { Card, CardContent } from "@tbms/ui/components/card";
import { FieldLabel, FieldStack } from "@tbms/ui/components/field";
import { FormGrid } from "@tbms/ui/components/form-layout";
import { Input } from "@tbms/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
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
          <FormGrid columns="two" className="gap-2 lg:min-w-[440px]">
            <FieldStack className="space-y-1.5">
              <FieldLabel>Date Range</FieldLabel>
              <Select
                value={String(preset)}
                onValueChange={(value) => {
                  if (value && isReportDatePreset(value)) {
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
            </FieldStack>

            <FieldStack className="space-y-1.5">
              <FieldLabel>Granularity</FieldLabel>
              <Select
                value={String(granularity)}
                onValueChange={(value) => {
                  if (value && isTrendGranularity(value)) {
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
            </FieldStack>
          </FormGrid>

          {preset === "custom" ? null : (
            <Badge variant="secondary" className="h-9 px-3 lg:w-fit">
              <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
              {rangeLabel}
            </Badge>
          )}
        </div>

        {preset === "custom" ? (
          <FormGrid columns="two" className="gap-2 lg:ml-auto lg:max-w-[440px]">
            <FieldStack className="space-y-1.5">
              <FieldLabel className="sr-only">Start Date</FieldLabel>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(event) => onDateChange("from", event.target.value)}
                className="h-9 text-xs"
              />
            </FieldStack>

            <FieldStack className="space-y-1.5">
              <FieldLabel className="sr-only">End Date</FieldLabel>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(event) => onDateChange("to", event.target.value)}
                className="h-9 text-xs"
              />
            </FieldStack>
          </FormGrid>
        ) : null}
      </CardContent>
    </Card>
  );
}
