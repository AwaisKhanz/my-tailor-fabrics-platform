import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex w-full rounded-snow-16 border border-primary bg-input text-[0.875rem] text-foreground shadow-sm ring-offset-background transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-4 focus:ring-offset-0 focus:[--tw-ring-color:hsl(var(--ring)/0.24)] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      uiSize: {
        default: "min-h-[104px] px-4 py-3",
        sm: "min-h-[80px] px-3.5 py-2.5",
      },
    },
    defaultVariants: {
      uiSize: "default",
    },
  },
);

export interface TextareaProps
  extends
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, uiSize, ...props }, ref) => {
    return (
      <textarea
        data-ui="input"
        className={cn(textareaVariants({ uiSize, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
