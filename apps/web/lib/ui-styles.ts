export const statusTextStyles = {
  info: "text-primary",
  success: "text-primary",
  warning: "text-secondary-foreground",
  destructive: "text-destructive",
} as const;

export const statusSurfaceStyles = {
  info: "border-primary/20 bg-primary/10 text-primary",
  success: "border-primary/20 bg-primary/10 text-primary",
  warning:
    "border-secondary-foreground/15 bg-secondary/80 text-secondary-foreground",
  destructive:
    "border-destructive/20 bg-destructive/10 text-destructive",
} as const;

export const statusIconStyles = {
  info: "border-primary/20 bg-primary/10 text-primary",
  success: "border-primary/20 bg-primary/10 text-primary",
  warning:
    "border-secondary-foreground/15 bg-secondary/80 text-secondary-foreground",
  destructive:
    "border-destructive/20 bg-destructive/10 text-destructive",
} as const;

export const chartToneStyles = [
  {
    bg: "bg-primary/80",
    stroke: "stroke-primary",
    text: "text-primary",
    fill: "fill-primary/12",
  },
  {
    bg: "bg-primary/60",
    stroke: "stroke-primary/80",
    text: "text-primary/80",
    fill: "fill-primary/10",
  },
  {
    bg: "bg-secondary-foreground/70",
    stroke: "stroke-secondary-foreground",
    text: "text-secondary-foreground",
    fill: "fill-secondary/40",
  },
  {
    bg: "bg-foreground/35",
    stroke: "stroke-foreground/70",
    text: "text-foreground/70",
    fill: "fill-foreground/10",
  },
] as const;
