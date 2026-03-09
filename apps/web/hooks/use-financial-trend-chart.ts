"use client";

import { useState } from "react";
import type { FinancialTrend } from "@tbms/shared-types";

export interface FinancialTrendChartPoint {
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

export function formatChartAxisNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function useFinancialTrendChart(trend: FinancialTrend) {
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

  const dataPoints: FinancialTrendChartPoint[] = trend.points.map(
    (point, index) => {
      const denominator = Math.max(1, trend.points.length - 1);
      const x = padLeft + (index / denominator) * plotWidth;

      return {
        x,
        revenueY: mapY(point.revenue),
        expensesY: mapY(point.expenses),
        netY: mapY(point.net),
        label: point.label,
        revenue: point.revenue,
        expenses: point.expenses,
        net: point.net,
      };
    },
  );

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

  return {
    hoveredIndex,
    setHoveredIndex,
    width,
    height,
    padLeft,
    padRight,
    padTop,
    padBottom,
    plotHeight,
    zeroY,
    dataPoints,
    revenuePath,
    expensesPath,
    netPath,
    areaPath,
    yAxisTicks,
    labelStep,
    hitAreas,
    activePoint,
    tooltipWidth,
    tooltipHeight,
    tooltipX,
    tooltipY,
  };
}
