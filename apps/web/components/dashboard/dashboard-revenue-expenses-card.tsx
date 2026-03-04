import { useState } from "react";
import { BarChart, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { formatPKR } from "@/lib/utils";

interface RevenueExpensesRow {
  month: string;
  revenue: number;
  expenses: number;
}

interface DashboardRevenueExpensesCardProps {
  rows: RevenueExpensesRow[];
}

interface ChartPoint extends RevenueExpensesRow {
  x: number;
  revenueY: number;
  expensesY: number;
  netY: number;
  net: number;
}

function pointsToPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) {
    return "";
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function DashboardRevenueExpensesCard({
  rows,
}: DashboardRevenueExpensesCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  const totalExpenses = rows.reduce((sum, row) => sum + row.expenses, 0);
  const net = totalRevenue - totalExpenses;

  const width = 820;
  const height = 214;
  const padLeft = 38;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 34;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const allValues = rows.flatMap((row) => [row.revenue, row.expenses, row.revenue - row.expenses]);
  const minValue = Math.min(0, ...allValues);
  let maxValue = Math.max(0, ...allValues, 1);
  if (maxValue === minValue) {
    maxValue += 1;
  }

  const valueRange = maxValue - minValue;
  const mapY = (value: number) => padTop + ((maxValue - value) / valueRange) * plotHeight;
  const zeroY = mapY(0);

  const points: ChartPoint[] = rows.map((row, index) => {
    const denominator = Math.max(1, rows.length - 1);
    const x = rows.length === 1
      ? padLeft + plotWidth / 2
      : padLeft + (index / denominator) * plotWidth;
    const netValue = row.revenue - row.expenses;

    return {
      ...row,
      x,
      revenueY: mapY(row.revenue),
      expensesY: mapY(row.expenses),
      netY: mapY(netValue),
      net: netValue,
    };
  });

  const revenuePath = pointsToPath(points.map((point) => ({ x: point.x, y: point.revenueY })));
  const expensesPath = pointsToPath(points.map((point) => ({ x: point.x, y: point.expensesY })));
  const netPath = pointsToPath(points.map((point) => ({ x: point.x, y: point.netY })));
  const areaPath =
    points.length > 1
      ? `${revenuePath} L ${points[points.length - 1]?.x} ${zeroY} L ${points[0]?.x} ${zeroY} Z`
      : "";

  const hitAreas = points.map((point, index) => {
    const previousX = points[index - 1]?.x ?? padLeft;
    const nextX = points[index + 1]?.x ?? width - padRight;
    const leftBoundary = index === 0 ? padLeft : (previousX + point.x) / 2;
    const rightBoundary = index === points.length - 1 ? width - padRight : (point.x + nextX) / 2;

    return {
      leftBoundary,
      width: Math.max(1, rightBoundary - leftBoundary),
    };
  });

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;
  const tooltipWidth = 190;
  const tooltipHeight = 66;
  const tooltipX = activePoint
    ? clamp(activePoint.x - tooltipWidth / 2, padLeft, width - padRight - tooltipWidth)
    : 0;
  const tooltipY = padTop + 10;

  return (
    <Card variant="premium" className="h-full">
      <CardHeader variant="rowSection" align="start">
        <div className="space-y-1">
          <CardTitle variant="dashboardSection">
            Revenue vs. Expenses
          </CardTitle>
          <p className="text-xs text-text-secondary">
            Monthly trend powered by backend report totals.
          </p>
        </div>
        <InfoTile tone="elevatedSoft" layout="row" padding="xs" className="rounded-md gap-1">
          <Label variant="dashboard">Last 6 Months</Label>
          <Clock className="ml-1 h-3 w-3" />
        </InfoTile>
      </CardHeader>
      <CardContent spacing="section" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoTile tone="elevatedSoft" padding="md">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-chart-1" />
              <Label variant="micro">
                Revenue
              </Label>
            </div>
            <p className="mt-1 text-lg font-bold text-chart-1">{formatPKR(totalRevenue)}</p>
          </InfoTile>
          <InfoTile tone="elevatedSoft" padding="md">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-chart-2" />
              <Label variant="micro">
                Expenses
              </Label>
            </div>
            <p className="mt-1 text-lg font-bold text-chart-2">{formatPKR(totalExpenses)}</p>
          </InfoTile>
          <InfoTile tone="elevatedSoft" padding="md">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-chart-3" />
              <Label variant="micro">
                Net
              </Label>
            </div>
            <p className={`mt-1 text-lg font-bold ${net < 0 ? "text-destructive" : "text-chart-3"}`}>
              {formatPKR(net)}
            </p>
          </InfoTile>
        </div>

        {rows.length < 2 ? (
          <InfoTile
            borderStyle="dashed"
            padding="none"
            className="relative flex h-[220px] w-full items-center justify-center"
          >
            <div className="flex max-w-md items-center gap-3 text-sm font-medium text-text-secondary/80">
              <BarChart className="h-10 w-10 opacity-20" />
              <span>
                {rows.length === 0
                  ? "No revenue and expense data available yet."
                  : "Need at least 2 periods to render a trend chart."}
              </span>
            </div>
          </InfoTile>
        ) : (
          <InfoTile padding="sm" className="overflow-hidden">
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
                    className="stroke-divider"
                    strokeDasharray="3 4"
                  />
                );
              })}

              <line x1={padLeft} y1={zeroY} x2={width - padRight} y2={zeroY} className="stroke-border" />

              {areaPath ? <path d={areaPath} className="fill-chart-1/15" /> : null}

              <path d={revenuePath} className="stroke-chart-1" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d={expensesPath} className="stroke-chart-2" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d={netPath} className="stroke-chart-3" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="5 4" />

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
                  <circle cx={point.x} cy={point.revenueY} r="2.8" className="fill-chart-1" />
                  <circle cx={point.x} cy={point.expensesY} r="2.4" className="fill-chart-2" />
                  <circle cx={point.x} cy={point.netY} r="2.1" className="fill-chart-3" />
                  <text x={point.x} y={height - 10} textAnchor="middle" className="fill-text-secondary text-[10px]">
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
                    className="fill-popover stroke-borderStrong/50"
                    strokeWidth="1"
                  />
                  <text x="10" y="17" className="fill-text-primary text-[11px] font-semibold">
                    {activePoint.month}
                  </text>
                  <text x="10" y="33" className="fill-chart-1 text-[10px]">
                    Revenue: {formatPKR(activePoint.revenue)}
                  </text>
                  <text x="10" y="47" className="fill-chart-2 text-[10px]">
                    Expenses: {formatPKR(activePoint.expenses)}
                  </text>
                  <text x="10" y="61" className="fill-chart-3 text-[10px]">
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
