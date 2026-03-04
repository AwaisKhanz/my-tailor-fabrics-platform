import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-error-muted text-destructive border-destructive/20",
        outline: "text-foreground",
        outlineSoft: "border-divider bg-surface-elevated text-foreground",
        success: "border-transparent bg-success-muted text-success border-success/20",
        warning: "border-transparent bg-warning-muted text-warning border-warning/20",
        info: "border-transparent bg-info-muted text-info border-info/20",
        ready: "border-transparent bg-ready-muted text-ready border-ready/20",
        admin: "border-transparent bg-sidebar-active text-sidebar-foreground border-sidebar-border",
        royal: "border-transparent bg-chart-4/10 text-chart-4 border-chart-4/10",
        amber: "border-transparent bg-warning-muted text-warning border-warning/20",
        premium: "font-bold uppercase tracking-tight text-[10px] px-2 py-0.5",
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
