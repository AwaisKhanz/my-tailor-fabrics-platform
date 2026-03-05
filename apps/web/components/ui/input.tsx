import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex h-10 w-full rounded-lg border border-inputSurface-border bg-inputSurface-background px-3 py-2 text-sm text-inputSurface-text shadow-sm shadow-shadowColor/5 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary placeholder:text-inputSurface-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-transparent placeholder:text-inputSurface-placeholder hover:border-divider/80 focus-visible:border-primary/50",
        premium:
          "h-10 border-divider bg-transparent hover:border-divider focus-visible:border-primary/60 focus-visible:ring-interaction-focus/30",
        premiumSuccess:
          "h-10 border-success/35 bg-success-muted/30 font-semibold text-success hover:border-success/55 focus-visible:border-success/70 focus-visible:ring-success/30",
        table:
          "h-9 rounded-md border-divider bg-surface-elevated  shadow-none hover:border-divider focus-visible:border-primary/55 focus-visible:ring-interaction-focus/25",
        searchCommand:
          "h-10 rounded-md border-divider bg-surface-elevated shadow-none hover:border-divider focus-visible:border-primary/55 focus-visible:ring-interaction-focus/25",
        readOnlyCode:
          "border-divider bg-code-background font-mono text-xs text-code-text shadow-none",
        inlineChip:
          "h-7 w-28 rounded-md border-primary/40 bg-surface px-2 py-1 text-sm shadow-none ring-1 ring-primary/20 hover:border-primary/60 focus-visible:border-primary/60 focus-visible:ring-primary/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface InputProps
  extends React.ComponentProps<"input">, VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
