import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import type { ProductivityPoint } from "@tbms/shared-types";
import { ChartEmptyState } from "@/components/ui/chart-empty-state";
import { ChartLoadingState } from "@/components/ui/chart-loading-state";
import { ChartShell } from "@/components/ui/chart-shell";
import { ReportsChartLegend } from "@/components/reports/reports-chart-legend";
import { formatPKR } from "@/lib/utils";

interface ReportsProductivityChartProps {
  loading: boolean;
  points: ProductivityPoint[];
}

export function ReportsProductivityChart({
  loading,
  points,
}: ReportsProductivityChartProps) {
  const topPoints = points.slice(0, 10);
  const [hoveredEmployeeId, setHoveredEmployeeId] = useState<string | null>(topPoints[0]?.employeeId ?? null);
  const activePoint = useMemo(
    () => topPoints.find((entry) => entry.employeeId === hoveredEmployeeId) ?? topPoints[0],
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
            <div className="rounded-lg border border-border/60 bg-background/35 px-3 py-2">
              <p className="text-xs font-semibold text-foreground">{activePoint.employeeName}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {activePoint.totalCompleted} completed • {formatPKR(activePoint.payout)}
              </p>
            </div>
          ) : null}

          {topPoints.map((point) => {
            const total = point.totalCompleted;
            const totalWidth = Math.max(2, Math.round((total / maxTotal) * 100));
            const itemsWidth =
              total > 0 ? Math.round((point.completedItems / total) * totalWidth) : 0;
            const tasksWidth = Math.max(0, totalWidth - itemsWidth);
            const isActive = point.employeeId === activePoint?.employeeId;

            return (
              <div
                key={point.employeeId}
                className={`space-y-1.5 rounded-lg border px-3 py-2.5 transition-colors ${isActive ? "border-primary/40 bg-primary/5" : "border-border/50 bg-background/30"}`}
                onMouseEnter={() => setHoveredEmployeeId(point.employeeId)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{point.employeeName}</p>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-muted-foreground">{total} completed</p>
                    <p className="text-xs text-muted-foreground">{formatPKR(point.payout)}</p>
                  </div>
                </div>

                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="bg-chart-1" style={{ width: `${itemsWidth}%` }} />
                  <div className="bg-chart-2" style={{ width: `${tasksWidth}%` }} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Items: {point.completedItems}</span>
                  <span>Tasks: {point.completedTasks}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </ChartShell>
  );
}
