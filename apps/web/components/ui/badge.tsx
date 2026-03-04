import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-[0.01em] transition-colors focus:outline-none focus:ring-2 focus:ring-interaction-focus focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-primary",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/85",
        destructive:
          "border-destructive/25 bg-error-muted text-destructive",
        outline: "border-divider bg-surface text-text-secondary",
        outlineSoft: "border-divider bg-surface-elevated text-text-primary",
        success: "border-success/25 bg-success-muted text-success",
        warning: "border-warning/25 bg-warning-muted text-warning",
        info: "border-info/25 bg-info-muted text-info",
        ready: "border-ready/25 bg-ready-muted text-ready",
        admin: "border-pending/25 bg-pending-muted text-pending",
        royal: "border-chart-4/20 bg-chart-4/10 text-chart-4",
        amber: "border-warning/25 bg-warning-muted text-warning",
        premium: "border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-primary",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        xs: "px-1.5 py-0 text-[10px] font-bold uppercase tracking-tight",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, className }))} {...props} />
  )
}

export { Badge, badgeVariants }
