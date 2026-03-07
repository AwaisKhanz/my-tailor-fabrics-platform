export const statusTextStyles = {
  info: "text-snow-blue-a dark:text-snow-blue-b",
  success: "text-snow-green-a dark:text-snow-green-b",
  warning: "text-snow-black dark:text-snow-yellow",
  destructive: "text-destructive",
} as const;

export const statusSurfaceStyles = {
  info:
    "border-snow-blue-a/35 bg-snow-blue-b/55 text-snow-black dark:border-snow-blue-b/25 dark:bg-snow-blue-a/15 dark:text-snow-blue-b",
  success:
    "border-snow-green-a/35 bg-snow-green-b/60 text-snow-black dark:border-snow-green-b/25 dark:bg-snow-green-a/15 dark:text-snow-green-b",
  warning:
    "border-snow-yellow/55 bg-snow-yellow/70 text-snow-black dark:border-snow-yellow/20 dark:bg-snow-yellow/12 dark:text-snow-yellow",
  destructive: "border-snow-red/25 bg-snow-red/10 text-snow-red dark:bg-snow-red/14",
} as const;

export const statusIconStyles = {
  info:
    "border-snow-blue-a/35 bg-snow-blue-b/55 text-snow-black dark:border-snow-blue-b/25 dark:bg-snow-blue-a/16 dark:text-snow-blue-b",
  success:
    "border-snow-green-a/35 bg-snow-green-b/60 text-snow-black dark:border-snow-green-b/25 dark:bg-snow-green-a/16 dark:text-snow-green-b",
  warning:
    "border-snow-yellow/55 bg-snow-yellow/72 text-snow-black dark:border-snow-yellow/20 dark:bg-snow-yellow/12 dark:text-snow-yellow",
  destructive: "border-snow-red/25 bg-snow-red/10 text-snow-red dark:bg-snow-red/14",
} as const;

export const chartToneStyles = [
  {
    bg: "bg-snow-purple-a",
    stroke: "stroke-snow-purple-a",
    text: "text-snow-purple-a dark:text-snow-purple-b",
    fill: "fill-snow-purple-a/16 dark:fill-snow-purple-a/22",
  },
  {
    bg: "bg-snow-blue-b",
    stroke: "stroke-snow-blue-b",
    text: "text-snow-blue-a dark:text-snow-blue-b",
    fill: "fill-snow-blue-b/22 dark:fill-snow-blue-b/18",
  },
  {
    bg: "bg-snow-green-a",
    stroke: "stroke-snow-green-a",
    text: "text-snow-green-a dark:text-snow-green-b",
    fill: "fill-snow-green-a/18 dark:fill-snow-green-a/24",
  },
  {
    bg: "bg-snow-yellow",
    stroke: "stroke-snow-yellow",
    text: "text-snow-black dark:text-snow-yellow",
    fill: "fill-snow-yellow/35 dark:fill-snow-yellow/20",
  },
] as const;
