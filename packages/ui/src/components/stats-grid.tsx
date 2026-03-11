import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@tbms/ui/lib/utils";

const statsGridVariants = cva("grid auto-rows-fr gap-4 lg:gap-5", {
  variants: {
    columns: {
      two: "grid-cols-1 sm:grid-cols-2",
      three: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
      four: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
      threeMd: "grid-cols-1 md:grid-cols-3",
    },
    flushSectionSpacing: {
      true: "space-y-0",
      false: "",
    },
  },
  defaultVariants: {
    columns: "three",
    flushSectionSpacing: false,
  },
});

export interface StatsGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statsGridVariants> {}

export function StatsGrid({
  className,
  columns,
  flushSectionSpacing,
  ...props
}: StatsGridProps) {
  return (
    <div
      className={cn(statsGridVariants({ columns, flushSectionSpacing, className }))}
      {...props}
    />
  );
}
