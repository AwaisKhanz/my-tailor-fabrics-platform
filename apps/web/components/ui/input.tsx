import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-snow-16 border border-border !bg-input shadow-sm text-snow-14 text-foreground ring-offset-background transition-[border-color,background-color] placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/25 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-snow-14 file:font-medium",
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
