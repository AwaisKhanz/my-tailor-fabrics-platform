import { AreaChart } from "lucide-react";
import type { FinancialTrend } from "@tbms/shared-types";
import { ChartEmptyState } from "@/components/ui/chart-empty-state";
import { ChartLoadingState } from "@/components/ui/chart-loading-state";
import { ChartShell } from "@/components/ui/chart-shell";
import { InfoTile } from "@/components/ui/info-tile";
import { ReportsChartLegend } from "@/components/reports/reports-chart-legend";
import {
  formatChartAxisNumber,
  useFinancialTrendChart,
} from "@/hooks/use-financial-trend-chart";
import { formatPKR } from "@/lib/utils";

interface ReportsFinancialTrendChartProps {
  loading: boolean;
  trend: FinancialTrend | null;
  title: string;
  description: string;
  actions?: React.ReactNode;
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
  const {
    activePoint,
    areaPath,
    dataPoints,
    expensesPath,
    height,
    hitAreas,
    hoveredIndex,
    labelStep,
    netPath,
    padBottom,
    padLeft,
    padRight,
    padTop,
    plotHeight,
    revenuePath,
    setHoveredIndex,
    tooltipHeight,
    tooltipWidth,
    tooltipX,
    tooltipY,
    width,
    yAxisTicks,
    zeroY,
  } = useFinancialTrendChart(trend);

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
              className="stroke-border"
              strokeDasharray="3 4"
            />
            <text
              x={8}
              y={tick.y + 4}
              className="fill-muted-foreground text-xs"
            >
              {formatChartAxisNumber(tick.value)}
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
                className="fill-muted-foreground text-xs"
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
              className="fill-card stroke-border/50"
              strokeWidth="1"
            />
            <text
              x="12"
              y="18"
              className="fill-foreground text-xs font-semibold"
            >
              {activePoint.label}
            </text>
            <text x="12" y="35" className="fill-chart-1 text-xs">
              Revenue: {formatPKR(activePoint.revenue)}
            </text>
            <text x="12" y="49" className="fill-chart-2 text-xs">
              Expenses: {formatPKR(activePoint.expenses)}
            </text>
            <text x="12" y="63" className="fill-chart-3 text-xs">
              Net: {formatPKR(activePoint.net)}
            </text>
          </g>
        ) : null}
      </svg>
    </InfoTile>
  );
}
