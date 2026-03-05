import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-xl border border-borderStrong/70 bg-card text-card-foreground shadow-[0_1px_2px_hsl(var(--shadow-color)/0.08)]",
  {
    variants: {
      variant: {
        default: "",
        panel: "shadow-none",
        shell: "overflow-hidden",
        shellFlat: "overflow-hidden shadow-none",
        elevatedPanel: "bg-surface-elevated shadow-none ",
        elevatedShell: "overflow-hidden bg-surface-elevated shadow-none",
        successSoft: "border-success/30 bg-success-muted/70 shadow-none",
        warningSoft: "border-warning/30 bg-warning-muted/70 shadow-none",
        errorSoft: "border-error/30 bg-error-muted/70 shadow-none",
        success: "border-success/45 bg-success-muted",
        error: "border-error/45 bg-error-muted",
        premium:
          "border-borderStrong/70 bg-card shadow-[0_6px_16px_hsl(var(--shadow-color)/0.12)]",
        interactive:
          "cursor-pointer transition-all duration-200 hover:border-borderStrong hover:bg-surface-elevated hover:shadow-[0_4px_12px_hsl(var(--shadow-color)/0.12)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const cardHeaderVariants = cva("flex flex-col", {
  variants: {
    variant: {
      default: "space-y-1.5 !rounded-b-none p-6",
      section:
        "border-b !rounded-b-none  border-divider bg-surface-elevated px-6 py-4",
      sectionSoft:
        "border-b !rounded-b-none border-divider bg-surface-elevated/80 px-6 py-4",
      rowSection:
        "flex-row items-center !rounded-b-none justify-between gap-3 border-b border-borderStrong/70 bg-surface-elevated px-6 py-4",
    },
    density: {
      default: "",
      compact: "px-5 py-3",
      comfortable: "px-6 py-5",
    },
    align: {
      default: "",
      start: "items-start",
      startResponsive: "items-start sm:items-center",
    },
    gap: {
      default: "",
      sm: "gap-3",
      md: "gap-4",
    },
  },
  defaultVariants: {
    variant: "default",
    density: "default",
    align: "default",
    gap: "default",
  },
});

export interface CardHeaderProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant, density, align, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardHeaderVariants({ variant, density, align, gap, className }),
        "rounded-xl",
      )}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const cardTitleVariants = cva(
  "font-semibold leading-none tracking-tight text-text-primary",
  {
    variants: {
      variant: {
        default: "",
        section: "text-base font-semibold tracking-tight",
        dashboard: "text-sm font-bold uppercase tracking-tight",
        dashboardSection: "text-base font-bold normal-case tracking-tight",
        heading: "text-3xl font-bold tracking-tight",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CardTitleProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardTitleVariants> {}

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardTitleVariants({ variant }), className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const cardDescriptionVariants = cva("text-text-secondary", {
  variants: {
    variant: {
      default: "text-sm",
      header: "mt-1 text-xs",
      compact: "text-xs",
      finePrint: "mt-1 text-[11px] leading-relaxed",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardDescriptionProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardDescriptionVariants> {}

const CardDescription = React.forwardRef<HTMLDivElement, CardDescriptionProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardDescriptionVariants({ variant, className }))}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

const cardContentVariants = cva("p-6 pt-0", {
  variants: {
    spacing: {
      default: "p-6 pt-0",
      compact: "p-5 pt-0",
      section: "p-6",
    },
    padding: {
      default: "",
      inset: "p-5 sm:p-6",
    },
  },
  defaultVariants: {
    spacing: "default",
    padding: "default",
  },
});

export interface CardContentProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, spacing, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ spacing, padding, className }))}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

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
});

export interface CardFooterProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, spacing, tone, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ spacing, tone, className }))}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
