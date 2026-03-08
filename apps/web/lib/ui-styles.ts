export const statusTextStyles = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
} as const;

export const statusSurfaceStyles = {
  info: "border-info/30 bg-info/12 text-info",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/35 bg-warning/16 text-warning",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
} as const;

export const statusIconStyles = {
  info: "border-info/35 bg-info/16 text-info",
  success: "border-success/35 bg-success/16 text-success",
  warning: "border-warning/38 bg-warning/18 text-warning",
  destructive: "border-destructive/32 bg-destructive/14 text-destructive",
} as const;

export const chartToneStyles = [
  {
    bg: "bg-chart-1",
    stroke: "stroke-chart-1",
    text: "text-chart-1",
    fill: "fill-chart-1/18",
  },
  {
    bg: "bg-chart-2",
    stroke: "stroke-chart-2",
    text: "text-chart-2",
    fill: "fill-chart-2/18",
  },
  {
    bg: "bg-chart-3",
    stroke: "stroke-chart-3",
    text: "text-chart-3",
    fill: "fill-chart-3/18",
  },
  {
    bg: "bg-chart-4",
    stroke: "stroke-chart-4",
    text: "text-chart-4",
    fill: "fill-chart-4/20",
  },
  {
    bg: "bg-chart-5",
    stroke: "stroke-chart-5",
    text: "text-chart-5",
    fill: "fill-chart-5/20",
  },
] as const;
