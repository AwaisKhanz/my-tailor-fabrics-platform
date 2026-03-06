import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { statusIconStyles } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";

const sectionIconVariants = cva(
  "inline-flex shrink-0 items-center justify-center text-primary",
  {
    variants: {
      tone: {
        default: "bg-primary/10 ring-primary/20 text-primary",
        info: statusIconStyles.info,
        success: statusIconStyles.success,
        warning: statusIconStyles.warning,
        destructive: statusIconStyles.destructive,
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
      tone: "default",
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
