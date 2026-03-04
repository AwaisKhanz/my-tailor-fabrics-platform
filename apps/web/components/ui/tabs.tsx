"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-xl border border-divider bg-surface-elevated p-1 text-text-secondary",
  {
    variants: {
      variant: {
        default: "h-9",
        premium: "h-auto w-full justify-start gap-8 rounded-none border-0 border-b border-divider bg-transparent p-0",
        segmented:
          "h-auto min-w-max justify-start gap-1 rounded-xl border border-divider bg-surface-elevated p-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-text-secondary data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm data-[state=active]:shadow-shadowColor/10",
        premium:
          "rounded-none border-b-2 border-transparent bg-transparent px-1 py-3 font-bold text-text-secondary shadow-none data-[state=active]:border-primary data-[state=active]:text-primary",
        segmented:
          "h-9 px-4 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm data-[state=active]:shadow-shadowColor/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & VariantProps<typeof tabsTriggerVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const tabsContentVariants = cva(
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction-focus focus-visible:ring-offset-2",
  {
    variants: {
      spacing: {
        default: "mt-2",
        roomy: "mt-4",
        none: "mt-0",
      },
    },
    defaultVariants: {
      spacing: "default",
    },
  },
)

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> &
    VariantProps<typeof tabsContentVariants>
>(({ className, spacing, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(tabsContentVariants({ spacing, className }))}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
