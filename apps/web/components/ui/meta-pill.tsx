import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const metaPillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border border-divider bg-surface-elevated px-2.5 py-1.5 text-xs text-text-secondary",
  {
    variants: {
      tone: {
        default: "",
        strong: "font-semibold text-text-primary",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

export interface MetaPillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metaPillVariants> {}

export function MetaPill({ className, tone, ...props }: MetaPillProps) {
  return <div className={cn(metaPillVariants({ tone }), className)} {...props} />;
}

