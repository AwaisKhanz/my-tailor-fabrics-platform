import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressTrackVariants = cva("w-full overflow-hidden rounded-full bg-muted", {
  variants: {
    size: {
      xs: "h-1.5",
      sm: "h-2",
      md: "h-2.5",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export interface ProgressTrackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressTrackVariants> {}

export function ProgressTrack({ className, size, ...props }: ProgressTrackProps) {
  return <div className={cn(progressTrackVariants({ size, className }))} {...props} />;
}

const progressFillVariants = cva(
  "w-full overflow-hidden rounded-full appearance-none [&::-moz-progress-bar]:rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full",
  {
  variants: {
    tone: {
      primary:
        "[&::-moz-progress-bar]:bg-primary [&::-webkit-progress-value]:bg-primary",
      info:
        "[&::-moz-progress-bar]:bg-primary [&::-webkit-progress-value]:bg-primary",
      warning:
        "[&::-moz-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-secondary",
      success:
        "[&::-moz-progress-bar]:bg-primary [&::-webkit-progress-value]:bg-primary",
      destructive:
        "[&::-moz-progress-bar]:bg-destructive [&::-webkit-progress-value]:bg-destructive",
      chart1:
        "[&::-moz-progress-bar]:bg-primary [&::-webkit-progress-value]:bg-primary",
      chart2:
        "[&::-moz-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-secondary",
      chart3:
        "[&::-moz-progress-bar]:bg-foreground [&::-webkit-progress-value]:bg-foreground",
    },
  },
  defaultVariants: {
    tone: "primary",
  },
});

interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof progressTrackVariants>,
    VariantProps<typeof progressFillVariants> {
  value: number;
  max?: number;
  fillClassName?: string;
}

export function ProgressBar({
  className,
  fillClassName,
  size,
  tone,
  value,
  max = 100,
  ...props
}: ProgressBarProps) {
  const percentage = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <progress
      className={cn(
        progressTrackVariants({ size }),
        "bg-muted [&::-webkit-progress-bar]:bg-muted",
        progressFillVariants({ tone }),
        className,
        fillClassName,
      )}
      value={percentage}
      max={100}
      {...props}
    />
  );
}
