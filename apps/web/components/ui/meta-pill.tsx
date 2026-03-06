import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const metaPillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-4 py-2 text-xs text-muted-foreground",
  {
    variants: {
      tone: {
        default: "",
        strong: "font-semibold text-foreground",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

export interface MetaPillProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metaPillVariants> {}

export function MetaPill({ className, tone, ...props }: MetaPillProps) {
  return (
    <div className={cn(metaPillVariants({ tone }), className)} {...props} />
  );
}
