import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const infoTileVariants = cva(
  "rounded-lg border border-divider text-text-primary",
  {
    variants: {
      tone: {
        elevated: "bg-surface-elevated",
        elevatedSoft: "bg-surface-elevated/70",
        elevatedMuted: "bg-surface-elevated/60",
        pending: "bg-pending-muted",
        success: "bg-success-muted",
        error: "bg-error-muted",
        info: "border-info/30 bg-info-muted",
        warning: "border-warning/30 bg-warning-muted",
        primarySoft: "border-primary/20 bg-primary/5",
        inverseSoft:
          "border-text-inverse/25 bg-text-inverse/10 text-text-inverse",
        surface: "bg-card",
        inputSurface: "bg-inputSurface-background",
      },
      padding: {
        none: "",
        xs: "px-2 py-1",
        sm: "px-2.5 py-2",
        md: "px-3 py-2",
        lg: "px-3 py-2.5",
        content: "p-3",
        contentLg: "p-4",
      },
      layout: {
        default: "",
        row: "flex items-center gap-2",
        between: "flex items-center justify-between",
        betweenGap: "flex items-center justify-between gap-3",
      },
      borderStyle: {
        solid: "",
        dashed: "border-dashed",
        dashedStrong: "border-2 border-dashed",
      },
      interaction: {
        default: "",
        interactive:
          "transition-all duration-200 hover:border-divider hover:shadow-sm hover:shadow-shadowColor/10",
        interactivePrimary:
          "transition-all duration-200 hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm hover:shadow-shadowColor/10",
      },
      radius: {
        lg: "rounded-lg",
        xl: "rounded-xl",
      },
    },
    defaultVariants: {
      tone: "elevated",
      padding: "lg",
      layout: "default",
      borderStyle: "solid",
      interaction: "default",
      radius: "lg",
    },
  },
);

export interface InfoTileProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof infoTileVariants> {}

export function InfoTile({
  className,
  tone,
  padding,
  layout,
  borderStyle,
  interaction,
  radius,
  ...props
}: InfoTileProps) {
  return (
    <div
      className={cn(
        infoTileVariants({
          tone,
          padding,
          layout,
          borderStyle,
          interaction,
          radius,
          className,
        }),
      )}
      {...props}
    />
  );
}
