import { BarChart, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { formatPKR } from "@/lib/utils";
import {
  type RevenueExpensesRow,
  useDashboardRevenueExpensesChart,
} from "@/hooks/use-dashboard-revenue-expenses-chart";

interface DashboardRevenueExpensesCardProps {
  rows: RevenueExpensesRow[];
}

export function DashboardRevenueExpensesCard({
  rows,
}: DashboardRevenueExpensesCardProps) {
  const {
    setHoveredIndex,
    totalRevenue,
    totalExpenses,
    net,
    width,
    height,
    padLeft,
    padRight,
    padTop,
    padBottom,
    plotHeight,
    zeroY,
    points,
    revenuePath,
    expensesPath,
    netPath,
    areaPath,
    hitAreas,
    activePoint,
    tooltipWidth,
    tooltipHeight,
    tooltipX,
    tooltipY,
  } = useDashboardRevenueExpensesChart(rows);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader layout="rowBetweenStart" surface="mutedSection" trimBottom>
        <div className="space-y-1">
          <CardTitle className="text-base font-bold normal-case ">
            Revenue vs. Expenses
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Monthly trend powered by backend report totals.
          </p>
        </div>
        <InfoTile
          tone="secondary"
          layout="row"
          padding="xs"
          className="rounded-md gap-1"
        >
          <Label className="text-sm font-bold uppercase  text-muted-foreground">
            Last 6 Months
          </Label>
          <Clock className="ml-1 h-3 w-3" />
        </InfoTile>
      </CardHeader>
      <CardContent spacing="section" className="flex flex-1 flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoTile tone="secondary" padding="md">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-chart-1" />
              <Label className="text-xs font-semibold uppercase  text-muted-foreground">
                Revenue
              </Label>
            </div>
            <p className="mt-1 text-lg font-bold text-chart-1">
              {formatPKR(totalRevenue)}
            </p>
          </InfoTile>
          <InfoTile tone="secondary" padding="md">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-chart-2" />
              <Label className="text-xs font-semibold uppercase  text-muted-foreground">
                Expenses
              </Label>
            </div>
            <p className="mt-1 text-lg font-bold text-chart-2">
              {formatPKR(totalExpenses)}
            </p>
          </InfoTile>
          <InfoTile tone="secondary" padding="md">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-chart-3" />
              <Label className="text-xs font-semibold uppercase  text-muted-foreground">
                Net
              </Label>
            </div>
            <p
              className={`mt-1 text-lg font-bold ${net < 0 ? "text-destructive" : "text-chart-3"}`}
            >
              {formatPKR(net)}
            </p>
          </InfoTile>
        </div>

        {rows.length < 2 ? (
          <InfoTile
            borderStyle="dashed"
            padding="none"
            className="relative flex h-full min-h-[220px] w-full flex-1 items-center justify-center"
          >
            <div className="flex max-w-md items-center gap-3 text-sm font-medium text-muted-foreground">
              <BarChart className="h-10 w-10 opacity-20" />
              <span>
                {rows.length === 0
                  ? "No revenue and expense data available yet."
                  : "Need at least 2 periods to render a trend chart."}
              </span>
            </div>
          </InfoTile>
        ) : (
          <InfoTile padding="sm" className="flex-1 overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-[200px] w-full sm:h-[214px]"
              role="img"
              aria-label="Dashboard revenue and expenses trend"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {[0, 0.25, 0.5, 0.75, 1].map((step) => {
                const y = padTop + step * plotHeight;
                return (
                  <line
                    key={step}
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    className="stroke-border"
                    strokeDasharray="3 4"
                  />
                );
              })}

              <line
                x1={padLeft}
                y1={zeroY}
                x2={width - padRight}
                y2={zeroY}
                className="stroke-border"
              />

              {areaPath ? (
                <path d={areaPath} className="fill-chart-1/15" />
              ) : null}

              <path
                d={revenuePath}
                className="stroke-chart-1"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={expensesPath}
                className="stroke-chart-2"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={netPath}
                className="stroke-chart-3"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="5 4"
              />

              {activePoint ? (
                <line
                  x1={activePoint.x}
                  y1={padTop}
                  x2={activePoint.x}
                  y2={height - padBottom}
                  className="stroke-chart-1/40"
                  strokeDasharray="4 4"
                />
              ) : null}

              {points.map((point) => (
                <g key={point.month}>
                  <circle
                    cx={point.x}
                    cy={point.revenueY}
                    r="2.8"
                    className="fill-chart-1"
                  />
                  <circle
                    cx={point.x}
                    cy={point.expensesY}
                    r="2.4"
                    className="fill-chart-2"
                  />
                  <circle
                    cx={point.x}
                    cy={point.netY}
                    r="2.1"
                    className="fill-chart-3"
                  />
                  <text
                    x={point.x}
                    y={height - 10}
                    textAnchor="middle"
                    className="fill-muted-foreground text-xs"
                  >
                    {point.month}
                  </text>
                </g>
              ))}

              {hitAreas.map((area, index) => (
                <rect
                  key={index}
                  x={area.leftBoundary}
                  y={padTop}
                  width={area.width}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseMove={() => setHoveredIndex(index)}
                />
              ))}

              {activePoint ? (
                <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                  <rect
                    x="0"
                    y="0"
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="8"
                    className="fill-card stroke-border/50"
                    strokeWidth="1"
                  />
                  <text
                    x="10"
                    y="17"
                    className="fill-foreground text-xs font-semibold"
                  >
                    {activePoint.month}
                  </text>
                  <text x="10" y="33" className="fill-chart-1 text-xs">
                    Revenue: {formatPKR(activePoint.revenue)}
                  </text>
                  <text x="10" y="47" className="fill-chart-2 text-xs">
                    Expenses: {formatPKR(activePoint.expenses)}
                  </text>
                  <text x="10" y="61" className="fill-chart-3 text-xs">
                    Net: {formatPKR(activePoint.net)}
                  </text>
                </g>
              ) : null}
            </svg>
          </InfoTile>
        )}
      </CardContent>
    </Card>
  );
}
