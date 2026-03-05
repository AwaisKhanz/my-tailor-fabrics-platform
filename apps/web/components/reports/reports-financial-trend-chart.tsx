import { useState } from "react";
import { AreaChart } from "lucide-react";
import type { FinancialTrend } from "@tbms/shared-types";
import { ChartEmptyState } from "@/components/ui/chart-empty-state";
import { ChartLoadingState } from "@/components/ui/chart-loading-state";
import { ChartShell } from "@/components/ui/chart-shell";
import { InfoTile } from "@/components/ui/info-tile";
import { ReportsChartLegend } from "@/components/reports/reports-chart-legend";
import { formatPKR } from "@/lib/utils";

interface ReportsFinancialTrendChartProps {
  loading: boolean;
  trend: FinancialTrend | null;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

interface ChartPoint {
  x: number;
  revenueY: number;
  expensesY: number;
  netY: number;
  label: string;
  revenue: number;
  expenses: number;
  net: number;
}

function pointsToPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    const only = points[0];
    return `M ${only.x} ${only.y}`;
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function ReportsFinancialTrendChart({
  loading,
  trend,
  title,
  description,
  actions,
}: ReportsFinancialTrendChartProps) {
  return (
    <ChartShell
      title={title}
      description={description}
      icon={<AreaChart className="h-4 w-4" />}
      actions={actions}
      className="h-full"
      legend={
        <ReportsChartLegend
          items={[
            { label: "Revenue", toneClassName: "bg-chart-1" },
            { label: "Expenses", toneClassName: "bg-chart-2" },
            { label: "Net", toneClassName: "bg-chart-3" },
          ]}
        />
      }
    >
      {loading ? <ChartLoadingState rows={3} /> : null}

      {!loading && (!trend || trend.points.length === 0) ? (
        <ChartEmptyState
          icon={AreaChart}
          title="No financial trend data"
          description="Try another date range to load revenue and expense movement."
        />
      ) : null}

      {!loading && trend && trend.points.length > 0 ? (
        <FinancialTrendSvg trend={trend} />
      ) : null}
    </ChartShell>
  );
}

function FinancialTrendSvg({ trend }: { trend: FinancialTrend }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 980;
  const height = 300;
  const padLeft = 36;
  const padRight = 24;
  const padTop = 22;
  const padBottom = 36;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const allValues = trend.points.flatMap((point) => [
    point.revenue,
    point.expenses,
    point.net,
  ]);
  const minValue = Math.min(0, ...allValues);
  let maxValue = Math.max(0, ...allValues, 1);
  if (maxValue === minValue) {
    maxValue += 1;
  }

  const valueRange = maxValue - minValue;
  const mapY = (value: number) =>
    padTop + ((maxValue - value) / valueRange) * plotHeight;
  const zeroY = mapY(0);

  const dataPoints: ChartPoint[] = trend.points.map((point, index) => {
    const denominator = Math.max(1, trend.points.length - 1);
    const x = padLeft + (index / denominator) * plotWidth;

    const revenueY = mapY(point.revenue);
    const expensesY = mapY(point.expenses);
    const netY = mapY(point.net);

    return {
      x,
      revenueY,
      expensesY,
      netY,
      label: point.label,
      revenue: point.revenue,
      expenses: point.expenses,
      net: point.net,
    };
  });

  const revenuePath = pointsToPath(
    dataPoints.map((point) => ({ x: point.x, y: point.revenueY })),
  );
  const expensesPath = pointsToPath(
    dataPoints.map((point) => ({ x: point.x, y: point.expensesY })),
  );
  const netPath = pointsToPath(
    dataPoints.map((point) => ({ x: point.x, y: point.netY })),
  );

  const areaPath =
    dataPoints.length > 1
      ? `${revenuePath} L ${dataPoints[dataPoints.length - 1]?.x} ${zeroY} L ${dataPoints[0]?.x} ${zeroY} Z`
      : "";

  const yAxisTicks = [0, 0.25, 0.5, 0.75, 1].map((step) => {
    const value = maxValue - step * valueRange;
    const y = padTop + step * plotHeight;
    return { value: Math.round(value), y };
  });

  const labelStep = Math.max(1, Math.ceil(dataPoints.length / 6));

  const hitAreas = dataPoints.map((point, index) => {
    const previousX = dataPoints[index - 1]?.x ?? padLeft;
    const nextX = dataPoints[index + 1]?.x ?? width - padRight;
    const leftBoundary = index === 0 ? padLeft : (previousX + point.x) / 2;
    const rightBoundary =
      index === dataPoints.length - 1
        ? width - padRight
        : (point.x + nextX) / 2;

    return {
      leftBoundary,
      width: Math.max(1, rightBoundary - leftBoundary),
    };
  });

  const activePoint = hoveredIndex !== null ? dataPoints[hoveredIndex] : null;
  const tooltipWidth = 220;
  const tooltipHeight = 72;
  const tooltipX = activePoint
    ? clamp(
        activePoint.x - tooltipWidth / 2,
        padLeft,
        width - padRight - tooltipWidth,
      )
    : 0;
  const tooltipY = padTop + 10;

  return (
    <InfoTile padding="sm" radius="xl" className="overflow-hidden h-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-h-[290px] w-full h-full"
        role="img"
        aria-label="Financial trend chart"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <line
          x1={padLeft}
          y1={zeroY}
          x2={width - padRight}
          y2={zeroY}
          className="stroke-border"
        />

        {yAxisTicks.map((tick) => (
          <g key={tick.y}>
            <line
              x1={padLeft}
              y1={tick.y}
              x2={width - padRight}
              y2={tick.y}
              className="stroke-divider"
              strokeDasharray="3 4"
            />
            <text
              x={8}
              y={tick.y + 4}
              className="fill-text-secondary text-[10px]"
            >
              {formatNumber(tick.value)}
            </text>
          </g>
        ))}

        {areaPath ? <path d={areaPath} className="fill-chart-1/15" /> : null}

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
            x2={activePoint.x}
            y1={padTop}
            y2={height - padBottom}
            className="stroke-chart-1/40"
            strokeDasharray="4 4"
          />
        ) : null}

        {dataPoints.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle
              cx={point.x}
              cy={point.revenueY}
              r={hoveredIndex === index ? "4.2" : "2.8"}
              className="fill-chart-1"
            />
            <circle
              cx={point.x}
              cy={point.expensesY}
              r={hoveredIndex === index ? "3.8" : "2.4"}
              className="fill-chart-2"
            />
            <circle
              cx={point.x}
              cy={point.netY}
              r={hoveredIndex === index ? "3.6" : "2.2"}
              className="fill-chart-3"
            />
            {index % labelStep === 0 || index === dataPoints.length - 1 ? (
              <text
                x={point.x}
                y={height - 10}
                textAnchor="middle"
                className="fill-text-secondary text-[10px]"
              >
                {point.label}
              </text>
            ) : null}
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
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseMove={() => setHoveredIndex(index)}
            className="cursor-crosshair"
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
              className="fill-popover stroke-divider/50"
              strokeWidth="1"
            />
            <text
              x="12"
              y="18"
              className="fill-text-primary text-[11px] font-semibold"
            >
              {activePoint.label}
            </text>
            <text x="12" y="35" className="fill-chart-1 text-[10px]">
              Revenue: {formatPKR(activePoint.revenue)}
            </text>
            <text x="12" y="49" className="fill-chart-2 text-[10px]">
              Expenses: {formatPKR(activePoint.expenses)}
            </text>
            <text x="12" y="63" className="fill-chart-3 text-[10px]">
              Net: {formatPKR(activePoint.net)}
            </text>
          </g>
        ) : null}
      </svg>
    </InfoTile>
  );
}
