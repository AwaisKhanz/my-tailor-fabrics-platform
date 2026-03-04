"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none text-text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "",
        dashboard: "text-[10px] font-bold uppercase tracking-tight opacity-70",
        micro: "text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary",
        microCaps: "text-[11px] uppercase tracking-[0.08em] text-text-secondary",
        microStrong: "text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary",
        tightCaps: "text-[10px] font-bold uppercase tracking-tight text-text-secondary",
      }
    },
    defaultVariants: {
      variant: "default",
    }
  }
)

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(labelVariants({ variant }), className)}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }
