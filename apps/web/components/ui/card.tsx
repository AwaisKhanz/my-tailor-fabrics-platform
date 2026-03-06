import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-ui="card"
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const cardHeaderVariants = cva("flex flex-col rounded-lg", {
  variants: {
    density: {
      default: "space-y-1.5 p-6",
      compact: "px-5 py-4",
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
  ({ className, density, align, gap, ...props }, ref) => (
    <div
      ref={ref}
      data-ui="card-header"
      className={cn(cardHeaderVariants({ density, align, gap, className }))}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export type CardTitleProps = React.HTMLAttributes<HTMLDivElement>;

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

export type CardDescriptionProps = React.HTMLAttributes<HTMLDivElement>;

const CardDescription = React.forwardRef<HTMLDivElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
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
      data-ui="card-content"
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
      mutedSection: "border-t border-border bg-muted/40",
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
      data-ui="card-footer"
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
