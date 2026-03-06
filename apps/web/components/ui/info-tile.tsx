import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { statusSurfaceStyles } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";

export const infoTileVariants = cva(
  "rounded-lg border border-border bg-card text-foreground shadow-sm",
  {
    variants: {
      tone: {
        default: "",
        secondary: "bg-secondary text-secondary-foreground",
        success: statusSurfaceStyles.success,
        destructive: statusSurfaceStyles.destructive,
        info: statusSurfaceStyles.info,
        warning: statusSurfaceStyles.warning,
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
          "transition-all duration-200 hover:border-border hover:shadow",
      },
      radius: {
        lg: "rounded-lg",
        xl: "rounded-xl",
      },
    },
    defaultVariants: {
      tone: "default",
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
      data-ui="info-tile"
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
