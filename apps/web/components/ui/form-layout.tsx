import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button, type ButtonProps } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const formStackVariants = cva("", {
  variants: {
    density: {
      compact: "space-y-3",
      default: "space-y-4",
      relaxed: "space-y-6",
    },
  },
  defaultVariants: {
    density: "default",
  },
});

interface FormStackProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof formStackVariants> {
  as?: React.ElementType;
}

export function FormStack({
  as: Component = "div",
  className,
  density,
  ...props
}: FormStackProps) {
  return <Component className={cn(formStackVariants({ density, className }))} {...props} />;
}

const dialogSectionVariants = cva("", {
  variants: {
    density: {
      compact: "py-3",
      default: "py-4",
      relaxed: "py-6",
    },
  },
  defaultVariants: {
    density: "default",
  },
});

interface DialogSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogSectionVariants> {}

export function DialogSection({ className, density, ...props }: DialogSectionProps) {
  return <div className={cn(dialogSectionVariants({ density, className }))} {...props} />;
}

const dialogActionRowVariants = cva("", {
  variants: {
    density: {
      compact: "pt-3",
      default: "pt-4",
      relaxed: "pt-5",
    },
    bordered: {
      true: "border-t border-border bg-card",
      false: "",
    },
  },
  defaultVariants: {
    density: "default",
    bordered: true,
  },
});

interface DialogActionRowProps
  extends React.ComponentPropsWithoutRef<typeof DialogFooter>,
    VariantProps<typeof dialogActionRowVariants> {}

export function DialogActionRow({
  className,
  density,
  bordered,
  ...props
}: DialogActionRowProps) {
  return (
    <DialogFooter
      className={cn(dialogActionRowVariants({ density, bordered, className }))}
      {...props}
    />
  );
}

const formActionRowVariants = cva("flex items-center gap-2 pt-4", {
  variants: {
    align: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    align: "end",
    wrap: true,
  },
});

interface FormActionRowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formActionRowVariants> {}

export function FormActionRow({ className, align, wrap, ...props }: FormActionRowProps) {
  return <div className={cn(formActionRowVariants({ align, wrap, className }))} {...props} />;
}

interface DialogFormActionsProps {
  onCancel: () => void;
  cancelText?: string;
  submitText: string;
  submittingText?: string;
  submitting?: boolean;
  submitFormId?: string;
  submitDisabled?: boolean;
  cancelVariant?: ButtonProps["variant"];
  submitVariant?: ButtonProps["variant"];
  cancelSize?: ButtonProps["size"];
  submitSize?: ButtonProps["size"];
  submitClassName?: string;
  className?: string;
}

export function DialogFormActions({
  onCancel,
  cancelText = "Cancel",
  submitText,
  submittingText = "Saving...",
  submitting = false,
  submitFormId,
  submitDisabled,
  cancelVariant = "outline",
  submitVariant = "default",
  cancelSize,
  submitSize,
  submitClassName,
  className,
}: DialogFormActionsProps) {
  return (
    <div className={cn("flex w-full justify-end gap-2", className)}>
      <Button type="button" variant={cancelVariant} size={cancelSize} onClick={onCancel}>
        {cancelText}
      </Button>
      <Button
        type="submit"
        form={submitFormId}
        variant={submitVariant}
        size={submitSize}
        disabled={submitDisabled || submitting}
        className={submitClassName}
      >
        {submitting ? submittingText : submitText}
      </Button>
    </div>
  );
}
