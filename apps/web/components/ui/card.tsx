import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-xl border border-divider bg-surface text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        panel: "shadow-none",
        shell: "overflow-hidden",
        shellFlat: "overflow-hidden shadow-none",
        elevatedPanel: "bg-surface-elevated shadow-none",
        elevatedShell: "overflow-hidden bg-surface-elevated shadow-none",
        successSoft: "border-success/30 bg-success-muted shadow-none",
        warningSoft: "border-warning/30 bg-warning-muted shadow-none",
        errorSoft: "border-error/30 bg-error-muted shadow-none",
        success: "border-success bg-success-muted",
        error: "border-error bg-error-muted",
        premium:
          "border-borderStrong/70 bg-surface-elevated shadow-sm",
        interactive:
          "cursor-pointer transition-all hover:border-borderStrong hover:bg-surface-elevated hover:shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, className }))}
    {...props}
  />
))
Card.displayName = "Card"

const cardHeaderVariants = cva(
  "flex flex-col",
  {
    variants: {
      variant: {
        default: "space-y-1.5 p-6",
        section: "border-b border-divider bg-surface-elevated px-6 py-4",
        sectionSoft: "border-b border-divider bg-surface-elevated/80 px-6 py-4",
        rowSection:
          "flex-row items-center justify-between gap-3 border-b border-divider bg-surface-elevated px-6 py-4",
      },
      density: {
        default: "",
        compact: "px-5 py-3",
        comfortable: "px-6 py-5",
      },
    },
    defaultVariants: {
      variant: "default",
      density: "default",
    },
  }
)

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<
  HTMLDivElement,
  CardHeaderProps
>(({ className, variant, density, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardHeaderVariants({ variant, density, className }))}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const cardTitleVariants = cva(
  "font-semibold leading-none tracking-tight",
  {
    variants: {
      variant: {
        default: "",
        dashboard: "text-sm font-bold uppercase tracking-tight",
        heading: "text-3xl font-bold tracking-tight",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface CardTitleProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardTitleVariants> {}

const CardTitle = React.forwardRef<
  HTMLDivElement,
  CardTitleProps
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardTitleVariants({ variant }), className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const cardContentVariants = cva("p-6 pt-0", {
  variants: {
    spacing: {
      default: "p-6 pt-0",
      compact: "p-5 pt-0",
      section: "p-6",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
})

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<
  HTMLDivElement,
  CardContentProps
>(({ className, spacing, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardContentVariants({ spacing, className }))}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const cardFooterVariants = cva("flex items-center p-6 pt-0", {
  variants: {
    spacing: {
      default: "p-6 pt-0",
      compact: "p-5 pt-0",
      section: "p-6",
    },
    tone: {
      default: "",
      mutedSection: "border-t border-divider bg-pending-muted/60",
    },
  },
  defaultVariants: {
    spacing: "default",
    tone: "default",
  },
})

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

const CardFooter = React.forwardRef<
  HTMLDivElement,
  CardFooterProps
>(({ className, spacing, tone, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardFooterVariants({ spacing, tone, className }))}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
