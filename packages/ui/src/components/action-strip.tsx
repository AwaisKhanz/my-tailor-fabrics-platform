import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@tbms/ui/lib/utils"

const actionStripVariants = cva("flex flex-wrap items-center gap-2", {
  variants: {
    width: {
      auto: "w-full sm:w-auto",
      full: "w-full",
    },
    align: {
      start: "justify-start",
      end: "justify-start sm:justify-end",
      between: "justify-between",
    },
    stack: {
      false: "",
      true: "flex-col items-stretch sm:flex-row sm:items-center",
    },
  },
  defaultVariants: {
    width: "auto",
    align: "end",
    stack: false,
  },
})

export interface ActionStripProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof actionStripVariants> {}

export function ActionStrip({
  className,
  width,
  align,
  stack,
  ...props
}: ActionStripProps) {
  return (
    <div
      data-ui="action-strip"
      className={cn(actionStripVariants({ width, align, stack }), className)}
      {...props}
    />
  )
}
