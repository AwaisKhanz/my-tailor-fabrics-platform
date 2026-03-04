import { useState } from "react";
import { PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { GarmentRevenue } from "@/lib/api/reports";
import { getChartBgClass, getChartStrokeClass, getChartTextClass } from "@/lib/chart-theme";
import { cn, formatPKR } from "@/lib/utils";

interface DashboardGarmentBreakdownCardProps {
  garments: GarmentRevenue[];
  totalItems: number;
}

export function DashboardGarmentBreakdownCard({
  garments,
  totalItems,
}: DashboardGarmentBreakdownCardProps) {
  const topGarments = garments.slice(0, 5);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const fallbackIndex = topGarments.length > 0 ? 0 : -1;
  const activeIndex = hoveredIndex ?? fallbackIndex;
  const activeGarment = activeIndex >= 0 ? topGarments[activeIndex] : undefined;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader variant="section" density="compact" className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <PieChart className="h-4 w-4" />
          </div>
          <CardTitle variant="dashboard" className="text-base normal-case tracking-tight">
            Garment Mix
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Contribution split across garment categories.
        </p>
      </CardHeader>

      <CardContent spacing="section" className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background/35 px-3 py-2">
          <div>
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Total Value
            </Label>
            <p className="mt-1 text-lg font-bold text-foreground">{formatPKR(totalItems)}</p>
          </div>
          <div className="text-right">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Active Types
            </Label>
            <p className="mt-1 text-lg font-bold text-foreground">{topGarments.length}</p>
          </div>
        </div>

        {topGarments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background/20 py-10 text-center text-xs text-muted-foreground">
            No garment data available
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-full max-w-[180px]">
              <div className="relative">
                <svg
                  viewBox="0 0 120 120"
                  className="h-[180px] w-[180px] -rotate-90"
                  role="img"
                  aria-label="Garment mix donut chart"
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <circle cx="60" cy="60" r={radius} className="fill-transparent stroke-muted" strokeWidth="12" />
                  {topGarments.map((garment, index) => {
                    const share = totalItems > 0 ? (garment.value / totalItems) * 100 : 0;
                    const slice = (share / 100) * circumference;
                    const isHovered = hoveredIndex === index;
                    const segment = (
                      <circle
                        key={garment.label}
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={isHovered ? "17" : "13"}
                        strokeLinecap="butt"
                        strokeDasharray={`${slice} ${circumference}`}
                        strokeDashoffset={-offset}
                        className={cn(
                          "cursor-pointer transition-all duration-200",
                          getChartStrokeClass(index),
                        )}
                        onMouseEnter={() => setHoveredIndex(index)}
                      />
                    );

                    offset += slice;
                    return segment;
                  })}
                </svg>

                {activeGarment ? (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Selected</p>
                    <p className="mt-1 max-w-[88px] truncate text-xs font-semibold leading-tight text-foreground">
                      {activeGarment.label}
                    </p>
                    <p className={cn("text-lg font-bold", getChartTextClass(activeIndex))}>
                      {totalItems > 0 ? ((activeGarment.value / totalItems) * 100).toFixed(1) : "0.0"}%
                    </p>
                    <p className="text-[11px] text-muted-foreground">{formatPKR(activeGarment.value)}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              {topGarments.map((garment, index) => {
                const share = totalItems > 0 ? (garment.value / totalItems) * 100 : 0;
                const isActive = hoveredIndex === index;

                return (
                  <div
                    key={garment.label}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-colors ${isActive ? "border-primary/40 bg-primary/5" : "border-border/50 bg-background/25"}`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", getChartBgClass(index))} />
                      <span className="truncate text-sm text-foreground">{garment.label}</span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-muted-foreground">{share.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">{formatPKR(garment.value)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
