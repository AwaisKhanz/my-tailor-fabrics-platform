import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex w-full rounded-lg border border-input bg-background text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground transition-[border-color,box-shadow,background-color] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      uiSize: {
        default: "min-h-[88px] px-4 py-3 text-sm",
        sm: "min-h-[72px] px-3 py-2 text-sm",
      },
    },
    defaultVariants: {
      uiSize: "default",
    },
  },
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
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
