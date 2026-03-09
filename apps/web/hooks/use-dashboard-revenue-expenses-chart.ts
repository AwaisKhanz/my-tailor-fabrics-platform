"use client";

import { useMemo, useState } from "react";

export interface RevenueExpensesRow {
  month: string;
  revenue: number;
  expenses: number;
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

export function useDashboardRevenueExpensesChart(rows: RevenueExpensesRow[]) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return useMemo(() => {
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

    const allValues = rows.flatMap((row) => [
      row.revenue,
      row.expenses,
      row.revenue - row.expenses,
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

    const points: ChartPoint[] = rows.map((row, index) => {
      const denominator = Math.max(1, rows.length - 1);
      const x =
        rows.length === 1
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

    const revenuePath = pointsToPath(
      points.map((point) => ({ x: point.x, y: point.revenueY })),
    );
    const expensesPath = pointsToPath(
      points.map((point) => ({ x: point.x, y: point.expensesY })),
    );
    const netPath = pointsToPath(
      points.map((point) => ({ x: point.x, y: point.netY })),
    );
    const areaPath =
      points.length > 1
        ? `${revenuePath} L ${points[points.length - 1]?.x} ${zeroY} L ${points[0]?.x} ${zeroY} Z`
        : "";

    const hitAreas = points.map((point, index) => {
      const previousX = points[index - 1]?.x ?? padLeft;
      const nextX = points[index + 1]?.x ?? width - padRight;
      const leftBoundary = index === 0 ? padLeft : (previousX + point.x) / 2;
      const rightBoundary =
        index === points.length - 1 ? width - padRight : (point.x + nextX) / 2;

      return {
        leftBoundary,
        width: Math.max(1, rightBoundary - leftBoundary),
      };
    });

    const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;
    const tooltipWidth = 190;
    const tooltipHeight = 66;
    const tooltipX = activePoint
      ? clamp(
          activePoint.x - tooltipWidth / 2,
          padLeft,
          width - padRight - tooltipWidth,
        )
      : 0;
    const tooltipY = padTop + 10;

    return {
      hoveredIndex,
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
    };
  }, [hoveredIndex, rows]);
}
