import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { statusSurfaceStyles } from "@/lib/ui-styles";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring/55 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default: "border-primary/12 bg-primary text-primary-foreground",
        secondary: "border-secondary bg-secondary text-secondary-foreground",
        outline: "border-primary bg-card text-muted-foreground",
        success: `${statusSurfaceStyles.success}`,
        warning: `${statusSurfaceStyles.warning}`,
        info: `${statusSurfaceStyles.info}`,
        destructive: `${statusSurfaceStyles.destructive}`,
      },
      size: {
        default: "px-2.5 py-1",
        xs: "px-2 py-0.5 text-xs ",
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
