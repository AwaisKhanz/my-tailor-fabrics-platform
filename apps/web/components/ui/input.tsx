import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const inputVariants = cva(
  "flex h-9 w-full rounded-md border border-inputSurface-border bg-inputSurface-background px-3 py-1 text-base text-inputSurface-text shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-inputSurface-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-interaction-focus disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-inputSurface-border",
        premium:
          "h-11 border-divider bg-inputSurface-background focus:border-primary/60 focus:ring-2 focus:ring-interaction-focus/30 transition-all",
        premiumSuccess:
          "h-11 border-divider bg-inputSurface-background font-semibold text-success focus:border-primary/60 focus:ring-2 focus:ring-interaction-focus/30 transition-all",
        table:
          "h-10 border-divider bg-inputSurface-background shadow-none focus:border-primary/60 focus:ring-2 focus:ring-interaction-focus/30",
        searchCommand:
          "h-9 border-borderStrong/70 bg-surface-elevated shadow-none focus:border-primary/60 focus:ring-2 focus:ring-interaction-focus/30",
        readOnlyCode:
          "border-divider bg-pending-muted font-mono text-xs shadow-none",
        inlineChip:
          "h-7 w-28 border-primary/50 bg-surface px-2 py-1 text-sm shadow-none ring-1 ring-primary/20 focus:border-primary/60 focus:ring-2 focus:ring-primary/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
