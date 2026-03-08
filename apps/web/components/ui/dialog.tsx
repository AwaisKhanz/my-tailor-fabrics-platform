"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-ui="dialog-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-foreground/24 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

type TabDirection = "forward" | "backward";

function getTabbableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    if (element.getAttribute("aria-hidden") === "true") {
      return false;
    }

    const style = window.getComputedStyle(element);
    const isVisible =
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      (element.offsetParent !== null || style.position === "fixed");

    return isVisible;
  });
}

function focusWithinDialog(container: HTMLElement, direction: TabDirection) {
  const tabbables = getTabbableElements(container);
  if (tabbables.length === 0) {
    return;
  }

  const target =
    direction === "backward" ? tabbables[tabbables.length - 1] : tabbables[0];

  target.focus();
}

function setForwardedRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

const dialogContentSizes = cva(
  "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        full: "max-w-[96vw]",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  },
);

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof dialogContentSizes>
>(
  (
    { className, children, size, onKeyDownCapture, onFocusCapture, ...props },
    ref,
  ) => {
    const [contentNode, setContentNode] = React.useState<React.ElementRef<
      typeof DialogPrimitive.Content
    > | null>(null);
    const lastTabDirectionRef = React.useRef<TabDirection>("forward");

    const setRefs = React.useCallback(
      (node: React.ElementRef<typeof DialogPrimitive.Content> | null) => {
        setContentNode(node);
        setForwardedRef(ref, node);
      },
      [ref],
    );

    const handleKeyDownCapture = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDownCapture?.(event);
        if (event.defaultPrevented || event.key !== "Tab") {
          return;
        }

        lastTabDirectionRef.current = event.shiftKey ? "backward" : "forward";
        const container = contentNode;
        if (!container || event.target !== container) {
          return;
        }

        event.preventDefault();
        focusWithinDialog(container, lastTabDirectionRef.current);
      },
      [contentNode, onKeyDownCapture],
    );

    const handleFocusCapture = React.useCallback(
      (event: React.FocusEvent<HTMLDivElement>) => {
        onFocusCapture?.(event);
        if (event.defaultPrevented || event.target !== event.currentTarget) {
          return;
        }

        const container = contentNode;
        if (!container) {
          return;
        }

        window.requestAnimationFrame(() => {
          if (document.activeElement === container) {
            focusWithinDialog(container, lastTabDirectionRef.current);
          }
        });
      },
      [contentNode, onFocusCapture],
    );

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={setRefs}
          data-ui="dialog-content"
          className={cn(
            dialogContentSizes({ size }),
            "grid gap-4 border border-border bg-popover p-6 text-popover-foreground shadow-sm sm:rounded-snow-24",
            className,
          )}
          onKeyDownCapture={handleKeyDownCapture}
          onFocusCapture={handleFocusCapture}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-snow-16 border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/55 focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const dialogHeaderVariants = cva("flex flex-col text-center sm:text-left", {
  variants: {
    spacing: {
      default: "space-y-2",
      relaxed: "space-y-3",
    },
    surface: {
      default: "",
      mutedSection: "border-b border-border bg-muted",
    },
    padding: {
      default: "",
      md: "px-6 py-4",
      lg: "px-6 py-8",
    },
    trimBottom: {
      false: "",
      true: "rounded-b-none",
    },
  },
  defaultVariants: {
    spacing: "default",
    surface: "default",
    padding: "default",
    trimBottom: false,
  },
});

interface DialogHeaderProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogHeaderVariants> {}

const DialogHeader = ({
  className,
  spacing,
  surface,
  padding,
  trimBottom,
  ...props
}: DialogHeaderProps) => (
  <div
    className={cn(
      dialogHeaderVariants({ spacing, surface, padding, trimBottom }),
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-0",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-[1.125rem] font-semibold leading-none ", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-[0.875rem] leading-6 text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
