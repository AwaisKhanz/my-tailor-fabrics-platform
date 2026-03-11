import { useState } from "react";
import type { DistributionPoint } from "@tbms/shared-types";
import { PieChart } from "lucide-react";
import { ChartEmptyState } from "@tbms/ui/components/chart-empty-state";
import { ChartLoadingState } from "@tbms/ui/components/chart-loading-state";
import { ChartShell } from "@tbms/ui/components/chart-shell";
import { InteractiveTile } from "@tbms/ui/components/interactive-tile";
import { ProgressBar } from "@tbms/ui/components/progress-track";
import {
  getChartBgClass,
  getChartStrokeClass,
  getChartTextClass,
} from "@/lib/chart-theme";
import { cn } from "@/lib/utils";

interface ReportsDistributionChartProps {
  loading: boolean;
  title: string;
  description: string;
  points: DistributionPoint[];
  mode?: "bar" | "donut";
  valueFormatter?: (value: number) => string;
}

export function ReportsDistributionChart({
  loading,
  title,
  description,
  points,
  mode = "bar",
  valueFormatter = (value) =>
    new Intl.NumberFormat("en-US").format(Math.round(value)),
}: ReportsDistributionChartProps) {
  return (
    <ChartShell
      title={title}
      description={description}
      icon={<PieChart className="h-4 w-4" />}
    >
      {loading ? <ChartLoadingState /> : null}

      {!loading && points.length === 0 ? (
        <ChartEmptyState
          icon={PieChart}
          title="No distribution data"
          description="This date range has no records for this breakdown."
        />
      ) : null}

      {!loading && points.length > 0 ? (
        mode === "donut" ? (
          <DistributionDonut points={points} valueFormatter={valueFormatter} />
        ) : (
          <DistributionBars points={points} valueFormatter={valueFormatter} />
        )
      ) : null}
    </ChartShell>
  );
}

function DistributionBars({
  points,
  valueFormatter,
}: {
  points: DistributionPoint[];
  valueFormatter: (value: number) => string;
}) {
  const topPoints = points.slice(0, 8);
  const [hoveredKey, setHoveredKey] = useState<string | null>(
    topPoints[0]?.key ?? null,
  );
  const maxValue = Math.max(...topPoints.map((point) => point.value), 1);
  const activePoint =
    topPoints.find((point) => point.key === hoveredKey) ?? topPoints[0];

  return (
    <div className="space-y-3">
      {activePoint ? (
        <div className="rounded-md bg-muted/50 px-3 py-2">
          <p className="text-xs font-semibold text-foreground">
            {activePoint.label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {activePoint.share.toFixed(1)}% •{" "}
            {valueFormatter(activePoint.value)}
          </p>
        </div>
      ) : null}

      {topPoints.map((point, index) => {
        const percentOfMax = Math.max(
          2,
          Math.round((point.value / maxValue) * 100),
        );
        const isActive = activePoint?.key === point.key;

        return (
          <InteractiveTile
            key={point.key}
            active={isActive}
            className="space-y-1.5 p-3"
            onMouseEnter={() => setHoveredKey(point.key)}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium text-foreground">
                {point.label}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                {point.share.toFixed(1)}%
              </p>
            </div>
            <ProgressBar
              value={percentOfMax}
              max={100}
              tone="chart1"
              size="sm"
              fillClassName={getChartBgClass(index)}
            />
            <p className="text-xs text-muted-foreground">
              {valueFormatter(point.value)}
            </p>
          </InteractiveTile>
        );
      })}
    </div>
  );
}

function DistributionDonut({
  points,
  valueFormatter,
}: {
  points: DistributionPoint[];
  valueFormatter: (value: number) => string;
}) {
  const topPoints = points.slice(0, 6);
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const activeIndex = Math.min(hoveredIndex, Math.max(0, topPoints.length - 1));
  const activePoint = topPoints[activeIndex];

  let offset = 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
      <div className="mx-auto w-full max-w-[220px]">
        <div className="relative">
          <svg
            viewBox="0 0 120 120"
            className="h-[220px] w-[220px] -rotate-90"
            role="img"
            aria-label={`${points.length} categories distribution`}
          >
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="fill-transparent stroke-border"
              strokeWidth="12"
            />
            {topPoints.map((point, index) => {
              const slice = (point.share / 100) * circumference;
              const segment = (
                <circle
                  key={point.key}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth={index === activeIndex ? "15" : "12"}
                  strokeLinecap="butt"
                  strokeDasharray={`${slice} ${circumference}`}
                  strokeDashoffset={-offset}
                  className={cn(
                    "cursor-pointer transition-all",
                    getChartStrokeClass(index),
                  )}
                  onMouseEnter={() => setHoveredIndex(index)}
                />
              );
              offset += slice;
              return segment;
            })}
          </svg>
          {activePoint ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-xs uppercase  text-muted-foreground">
                Selected
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {activePoint.label}
              </p>
              <p
                className={cn(
                  "text-lg font-bold",
                  getChartTextClass(activeIndex),
                )}
              >
                {activePoint.share.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {valueFormatter(activePoint.value)}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        {topPoints.map((point, index) => (
          <div
            key={point.key}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-colors ${
              index === activeIndex
                ? "border-primary/40 bg-accent"
                : "border-border bg-card hover:border-border"
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  getChartBgClass(index),
                )}
              />
              <span className="text-sm text-foreground">{point.label}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground">
                {point.share.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {valueFormatter(point.value)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
