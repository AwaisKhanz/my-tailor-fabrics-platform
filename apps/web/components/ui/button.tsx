import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium leading-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:saturate-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_2px_hsl(var(--shadow-color)/0.16)] hover:bg-primary/90 hover:shadow-[0_2px_8px_hsl(var(--shadow-color)/0.16)] active:bg-primary/85",
        premium:
          "bg-primary text-primary-foreground shadow-[0_2px_10px_hsl(var(--shadow-color)/0.14)] hover:bg-primary/92 hover:shadow-[0_4px_14px_hsl(var(--shadow-color)/0.14)] active:bg-primary/86",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_1px_2px_hsl(var(--shadow-color)/0.16)] hover:bg-destructive/90 hover:shadow-[0_2px_8px_hsl(var(--shadow-color)/0.16)] active:bg-destructive/84",
        outline:
          "border border-inputSurface-border bg-inputSurface-background text-text-primary hover:border-borderStrong hover:bg-interaction-hover hover:text-text-primary",
        outlineDashed:
          "border border-dashed border-inputSurface-border bg-inputSurface-background text-text-primary hover:border-borderStrong hover:bg-interaction-hover hover:text-text-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_1px_2px_hsl(var(--shadow-color)/0.14)] hover:bg-secondary/85 hover:shadow-[0_2px_8px_hsl(var(--shadow-color)/0.14)] active:bg-secondary/78",
        ghost: "text-text-secondary hover:bg-interaction-hover hover:text-text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        muted:
          "border border-divider bg-surface-elevated text-text-secondary hover:border-borderStrong hover:bg-interaction-hover hover:text-text-primary",
        dashboard: "border border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-active ",
        tableIcon:
          "border border-transparent text-text-secondary hover:border-divider hover:bg-interaction-hover hover:text-text-primary",
        tableDanger:
          "border border-transparent text-text-secondary hover:border-destructive/25 hover:bg-error-muted hover:text-destructive",
        tableReset:
          "h-10 border border-transparent text-xs font-semibold text-text-secondary hover:border-divider hover:bg-interaction-hover hover:text-text-primary",
        tablePrimary:
          "border border-divider bg-surface-elevated text-text-primary hover:border-borderStrong hover:bg-interaction-hover",
        tableSuccess:
          "border border-transparent text-success hover:border-success/25 hover:bg-success-muted hover:text-success",
        infoGhost:
          "text-info hover:bg-info-muted hover:text-info",
        outlinePrimary:
          "border border-primary/30 bg-transparent text-primary hover:bg-interaction-hover hover:text-primary",
        sidebarIcon:
          "rounded-lg border border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-active hover:text-sidebar-foreground",
        sidebarIconMuted:
          "rounded-lg border border-sidebar-border bg-transparent text-text-secondary hover:bg-interaction-hover hover:text-text-primary",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 px-2 text-[10px]",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-11 px-8 rounded-lg",
        icon: "h-9 w-9",
        iconSm: "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
