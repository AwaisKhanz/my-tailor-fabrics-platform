import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { statusSurfaceStyles } from "@/lib/ui-styles";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-input bg-background text-foreground",
        success: statusSurfaceStyles.success,
        warning: statusSurfaceStyles.warning,
        info: statusSurfaceStyles.info,
        destructive: statusSurfaceStyles.destructive,
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        xs: "px-1.5 py-0 text-[10px] font-bold uppercase tracking-tight",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      data-ui="badge"
      data-variant={variant ?? "default"}
      data-size={size ?? "default"}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
