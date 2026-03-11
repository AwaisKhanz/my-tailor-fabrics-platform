import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Label } from "@tbms/ui/components/label";
import { Text } from "@tbms/ui/components/typography";
import { cn } from "@tbms/ui/lib/utils";

const fieldLabelVariants = cva("", {
  variants: {
    size: {
      default: "text-sm font-bold",
      compact: "text-xs font-bold",
      inherit: "",
    },
    tone: {
      default: "text-muted-foreground",
      foreground: "text-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
    },
    block: {
      true: "block",
      false: "",
    },
  },
  defaultVariants: {
    size: "default",
    tone: "default",
    block: false,
  },
});

export interface FieldLabelProps
  extends
    React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof fieldLabelVariants> {
  as?: "label" | "span";
}

export function FieldLabel({
  as = "label",
  className,
  size,
  tone,
  block,
  htmlFor,
  ...props
}: FieldLabelProps) {
  if (as === "span") {
    return (
      <span
        className={cn(fieldLabelVariants({ size, tone, block }), className)}
        {...props}
      />
    );
  }

  return (
    <Label
      htmlFor={htmlFor}
      className={cn(fieldLabelVariants({ size, tone, block }), className)}
      {...props}
    />
  );
}

const fieldErrorVariants = cva("text-destructive", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
    },
    inset: {
      true: "mt-1",
      false: "",
    },
  },
  defaultVariants: {
    size: "xs",
    inset: false,
  },
});

export interface FieldErrorProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof fieldErrorVariants> {
  as?: "p" | "span" | "div";
}

export function FieldError({
  as: Component = "p",
  className,
  size,
  inset,
  ...props
}: FieldErrorProps) {
  return (
    <Component
      className={cn(fieldErrorVariants({ size, inset }), className)}
      {...props}
    />
  );
}

export type FieldHintProps = React.ComponentProps<typeof Text>;

export function FieldHint({
  className,
  variant = "muted",
  ...props
}: FieldHintProps) {
  return (
    <Text className={cn("text-xs", className)} variant={variant} {...props} />
  );
}

export function FieldStack({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}
