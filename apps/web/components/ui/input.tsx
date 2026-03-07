import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-[16px] border border-input bg-card text-[0.875rem] text-foreground shadow-sm ring-offset-background transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/16 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-[0.875rem] file:font-medium",
  {
    variants: {
      uiSize: {
        default: "h-11 px-4 py-2",
        sm: "h-10 px-3.5 py-2",
      },
    },
    defaultVariants: {
      uiSize: "default",
    },
  },
);

export interface InputProps
  extends
    Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, uiSize, ...props }, ref) => {
    return (
      <input
        type={type}
        data-ui="input"
        className={cn(inputVariants({ uiSize, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
