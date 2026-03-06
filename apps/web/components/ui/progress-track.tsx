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

const progressFillVariants = cva("h-full rounded-full transition-[width] duration-300 ease-out", {
  variants: {
    tone: {
      primary: "bg-primary",
      info: "bg-primary",
      warning: "bg-secondary",
      success: "bg-primary",
      destructive: "bg-destructive",
      chart1: "bg-primary",
      chart2: "bg-secondary",
      chart3: "bg-foreground",
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
    <ProgressTrack className={className} size={size} {...props}>
      <div className={cn(progressFillVariants({ tone }), fillClassName)} style={{ width: `${percentage}%` }} />
    </ProgressTrack>
  );
}
