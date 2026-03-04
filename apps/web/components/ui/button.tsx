import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/85",
        premium:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/85",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-inputSurface-border bg-inputSurface-background text-foreground shadow-sm hover:bg-interaction-hover hover:text-foreground",
        outlineDashed:
          "border border-dashed border-inputSurface-border bg-inputSurface-background text-foreground shadow-sm hover:bg-interaction-hover hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-interaction-hover hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        muted: "border border-divider bg-surface text-text-secondary hover:bg-interaction-hover hover:text-foreground",
        dashboard: "border border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-active ",
        tableIcon:
          "border border-transparent text-text-secondary hover:border-divider hover:bg-interaction-hover hover:text-foreground",
        tableDanger:
          "border border-transparent text-text-secondary hover:border-destructive/25 hover:bg-error-muted hover:text-destructive",
        tableReset:
          "h-10 border border-transparent text-xs font-semibold text-text-secondary hover:border-divider hover:bg-interaction-hover hover:text-foreground",
        tablePrimary:
          "border border-divider bg-surface-elevated text-primary hover:bg-interaction-hover",
        tableSuccess:
          "border border-transparent text-success hover:border-success/25 hover:bg-success-muted hover:text-success",
        infoGhost:
          "text-info hover:bg-info-muted hover:text-info",
        outlinePrimary:
          "border border-primary/30 bg-transparent text-primary hover:bg-interaction-hover hover:text-primary",
        sidebarIcon:
          "rounded-lg border border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-active hover:text-sidebar-foreground",
        sidebarIconMuted:
          "rounded-lg border border-sidebar-border bg-transparent text-text-secondary hover:bg-interaction-hover hover:text-foreground",
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
