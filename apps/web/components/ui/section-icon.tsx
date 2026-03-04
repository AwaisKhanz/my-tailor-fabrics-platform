import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionIconVariants = cva(
  "inline-flex shrink-0 items-center justify-center text-primary",
  {
    variants: {
      tone: {
        sidebar: "bg-sidebar-active ring-sidebar-border",
        primary: "bg-primary/10 ring-primary/20",
        info: "bg-info/10 ring-info/20 text-info",
        infoSoft: "bg-info-muted ring-divider text-info",
        warningSoft: "bg-warning-muted ring-divider text-warning",
        errorSoft: "bg-error-muted ring-divider text-destructive",
        timelinePrimary: "border-2 border-primary bg-surface text-primary",
      },
      size: {
        sm: "h-7 w-7 rounded-lg",
        md: "h-8 w-8 rounded-lg",
        lg: "h-9 w-9 rounded-xl",
      },
      framed: {
        true: "ring-1",
        false: "ring-0",
      },
    },
    defaultVariants: {
      tone: "primary",
      size: "md",
      framed: true,
    },
  },
);

export interface SectionIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionIconVariants> {}

export function SectionIcon({
  className,
  tone,
  size,
  framed,
  ...props
}: SectionIconProps) {
  return (
    <div className={cn(sectionIconVariants({ tone, size, framed, className }))} {...props} />
  );
}
