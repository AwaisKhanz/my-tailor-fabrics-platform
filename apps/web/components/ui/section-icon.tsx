import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { statusIconStyles } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";

const sectionIconVariants = cva(
  "inline-flex shrink-0 items-center justify-center border text-primary shadow-sm",
  {
    variants: {
      tone: {
        default: "border-primary/10 bg-primary/10 text-primary dark:border-primary/20 dark:bg-primary/12",
        info: statusIconStyles.info,
        success: statusIconStyles.success,
        warning: statusIconStyles.warning,
        destructive: statusIconStyles.destructive,
      },
      size: {
        sm: "h-8 w-8 rounded-[14px]",
        md: "h-10 w-10 rounded-[16px]",
        lg: "h-11 w-11 rounded-[18px]",
      },
      framed: {
        true: "",
        false: "border-transparent shadow-none",
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
