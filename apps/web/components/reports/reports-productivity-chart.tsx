import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import type { ProductivityPoint } from "@tbms/shared-types";
import { ChartEmptyState } from "@/components/ui/chart-empty-state";
import { ChartLoadingState } from "@/components/ui/chart-loading-state";
import { ChartShell } from "@/components/ui/chart-shell";
import { InfoTile } from "@/components/ui/info-tile";
import { InteractiveTile } from "@/components/ui/interactive-tile";
import { ProgressTrack } from "@/components/ui/progress-track";
import { ReportsChartLegend } from "@/components/reports/reports-chart-legend";
import { formatPKR } from "@/lib/utils";

interface ReportsProductivityChartProps {
  loading: boolean;
  points: ProductivityPoint[];
}

const PRODUCTIVITY_SEGMENTS = 20;

export function ReportsProductivityChart({
  loading,
  points,
}: ReportsProductivityChartProps) {
  const topPoints = points.slice(0, 10);
  const [hoveredEmployeeId, setHoveredEmployeeId] = useState<string | null>(
    topPoints[0]?.employeeId ?? null,
  );
  const activePoint = useMemo(
    () =>
      topPoints.find((entry) => entry.employeeId === hoveredEmployeeId) ??
      topPoints[0],
    [topPoints, hoveredEmployeeId],
  );
  const maxTotal = Math.max(
    ...topPoints.map((point) => point.totalCompleted),
    1,
  );

  return (
    <ChartShell
      title="Top Tailor Productivity"
      description="Completed items and design tasks with payout context."
      icon={<Users className="h-4 w-4" />}
      legend={
        <ReportsChartLegend
          items={[
            { label: "Items", toneClassName: "bg-chart-1" },
            { label: "Tasks", toneClassName: "bg-chart-2" },
          ]}
        />
      }
    >
      {loading ? <ChartLoadingState rows={5} /> : null}

      {!loading && topPoints.length === 0 ? (
        <ChartEmptyState
          icon={Users}
          title="No productivity activity"
          description="No completed work was found for this date range."
        />
      ) : null}

      {!loading && topPoints.length > 0 ? (
        <div className="space-y-3">
          {activePoint ? (
            <InfoTile tone="secondary" padding="md">
              <p className="text-xs font-semibold text-foreground">
                {activePoint.employeeName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activePoint.totalCompleted} completed •{" "}
                {formatPKR(activePoint.payout)}
              </p>
            </InfoTile>
          ) : null}

          {topPoints.map((point) => {
            const total = point.totalCompleted;
            const totalSegments = Math.max(
              1,
              Math.round((total / maxTotal) * PRODUCTIVITY_SEGMENTS),
            );
            const itemSegments =
              total > 0
                ? Math.min(
                    totalSegments,
                    Math.round((point.completedItems / total) * totalSegments),
                  )
                : 0;
            const taskSegments = Math.max(0, totalSegments - itemSegments);
            const isActive = point.employeeId === activePoint?.employeeId;
            const bars = Array.from(
              { length: PRODUCTIVITY_SEGMENTS },
              (_, index) => {
                if (index < itemSegments) {
                  return "bg-chart-1";
                }
                if (index < itemSegments + taskSegments) {
                  return "bg-chart-2";
                }
                return "bg-muted/40";
              },
            );

            return (
              <InteractiveTile
                key={point.employeeId}
                active={isActive}
                className="space-y-1.5 px-3 py-2.5"
                onMouseEnter={() => setHoveredEmployeeId(point.employeeId)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {point.employeeName}
                  </p>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {total} completed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPKR(point.payout)}
                    </p>
                  </div>
                </div>

                <ProgressTrack
                  size="md"
                  className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-px bg-transparent"
                >
                  {bars.map((barClassName, index) => (
                    <span
                      key={`${point.employeeId}-${index}`}
                      className={barClassName}
                    />
                  ))}
                </ProgressTrack>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Items: {point.completedItems}</span>
                  <span>Tasks: {point.completedTasks}</span>
                </div>
              </InteractiveTile>
            );
          })}
        </div>
      ) : null}
    </ChartShell>
  );
}
