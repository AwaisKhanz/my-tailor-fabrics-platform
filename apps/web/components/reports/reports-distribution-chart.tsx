import { useState } from "react";
import type { DistributionPoint } from "@tbms/shared-types";
import { PieChart } from "lucide-react";
import { ChartEmptyState } from "@/components/ui/chart-empty-state";
import { ChartLoadingState } from "@/components/ui/chart-loading-state";
import { ChartShell } from "@/components/ui/chart-shell";
import { InfoTile } from "@/components/ui/info-tile";
import { ProgressBar } from "@/components/ui/progress-track";
import { getChartBgClass, getChartStrokeClass, getChartTextClass } from "@/lib/chart-theme";
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
  valueFormatter = (value) => new Intl.NumberFormat("en-US").format(Math.round(value)),
}: ReportsDistributionChartProps) {
  return (
    <ChartShell title={title} description={description} icon={<PieChart className="h-4 w-4" />}>
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
  const [hoveredKey, setHoveredKey] = useState<string | null>(topPoints[0]?.key ?? null);
  const maxValue = Math.max(...topPoints.map((point) => point.value), 1);
  const activePoint = topPoints.find((point) => point.key === hoveredKey) ?? topPoints[0];

  return (
    <div className="space-y-3">
      {activePoint ? (
        <InfoTile tone="elevatedSoft" padding="md">
          <p className="text-xs font-semibold text-text-primary">{activePoint.label}</p>
          <p className="mt-1 text-[11px] text-text-secondary">
            {activePoint.share.toFixed(1)}% • {valueFormatter(activePoint.value)}
          </p>
        </InfoTile>
      ) : null}

      {topPoints.map((point, index) => {
        const percentOfMax = Math.max(2, Math.round((point.value / maxValue) * 100));
        const isActive = activePoint?.key === point.key;

        return (
          <div
            key={point.key}
            className={`space-y-1.5 rounded-lg border p-3 transition-colors ${
              isActive
                ? "border-primary/40 bg-interaction-hover"
                : "border-divider/70 bg-surface-elevated/60 hover:border-borderStrong/70"
            }`}
            onMouseEnter={() => setHoveredKey(point.key)}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium text-text-primary">{point.label}</p>
              <p className="text-xs font-semibold text-text-secondary">{point.share.toFixed(1)}%</p>
            </div>
            <ProgressBar
              value={percentOfMax}
              max={100}
              tone="chart1"
              size="sm"
              fillClassName={getChartBgClass(index)}
            />
            <p className="text-xs text-text-secondary">{valueFormatter(point.value)}</p>
          </div>
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
          <circle cx="60" cy="60" r={radius} className="fill-transparent stroke-pending-muted" strokeWidth="12" />
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
                className={cn("cursor-pointer transition-all", getChartStrokeClass(index))}
                onMouseEnter={() => setHoveredIndex(index)}
              />
            );
            offset += slice;
            return segment;
          })}
          </svg>
          {activePoint ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-[11px] uppercase tracking-[0.08em] text-text-secondary">Selected</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">{activePoint.label}</p>
              <p className={cn("text-lg font-bold", getChartTextClass(activeIndex))}>
                {activePoint.share.toFixed(1)}%
              </p>
              <p className="text-[11px] text-text-secondary">{valueFormatter(activePoint.value)}</p>
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
                ? "border-primary/40 bg-interaction-hover"
                : "border-divider/70 bg-surface-elevated/60 hover:border-borderStrong/70"
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn("h-2.5 w-2.5 rounded-full", getChartBgClass(index))}
              />
              <span className="text-sm text-text-primary">{point.label}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-text-secondary">{point.share.toFixed(1)}%</p>
              <p className="text-xs text-text-secondary">{valueFormatter(point.value)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
