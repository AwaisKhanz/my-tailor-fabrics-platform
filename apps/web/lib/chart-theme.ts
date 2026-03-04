const CHART_BG_CLASSES = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
  "bg-chart-8",
] as const;

const CHART_STROKE_CLASSES = [
  "stroke-chart-1",
  "stroke-chart-2",
  "stroke-chart-3",
  "stroke-chart-4",
  "stroke-chart-5",
  "stroke-chart-6",
  "stroke-chart-7",
  "stroke-chart-8",
] as const;

const CHART_TEXT_CLASSES = [
  "text-chart-1",
  "text-chart-2",
  "text-chart-3",
  "text-chart-4",
  "text-chart-5",
  "text-chart-6",
  "text-chart-7",
  "text-chart-8",
] as const;

const CHART_FILL_CLASSES = [
  "fill-chart-1",
  "fill-chart-2",
  "fill-chart-3",
  "fill-chart-4",
  "fill-chart-5",
  "fill-chart-6",
  "fill-chart-7",
  "fill-chart-8",
] as const;

export function getChartBgClass(index: number): string {
  return CHART_BG_CLASSES[index % CHART_BG_CLASSES.length];
}

export function getChartStrokeClass(index: number): string {
  return CHART_STROKE_CLASSES[index % CHART_STROKE_CLASSES.length];
}

export function getChartTextClass(index: number): string {
  return CHART_TEXT_CLASSES[index % CHART_TEXT_CLASSES.length];
}

export function getChartFillClass(index: number): string {
  return CHART_FILL_CLASSES[index % CHART_FILL_CLASSES.length];
}
