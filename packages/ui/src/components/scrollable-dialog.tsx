import * as React from "react";
import { cn } from "@tbms/ui/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@tbms/ui/components/dialog";
import { DialogActionRow } from "@tbms/ui/components/form-layout";
import { ScrollArea } from "@tbms/ui/components/scroll-area";

interface ScrollableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  contentSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  maxWidthClass?: string;
  maxHeightClass?: string;
}

/**
 * A generic dialog wrapper that ensures forms or large content
 * do not overflow the screen, keeping headers and footers pinned.
 */
export function ScrollableDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footerActions,
  contentSize = "md",
  maxWidthClass = "sm:max-w-md",
  maxHeightClass = "max-h-[90vh]",
}: ScrollableDialogProps) {
  React.useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        !activeElement.closest("[data-slot='dialog-content']")
      ) {
        activeElement.blur();
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen && typeof document !== "undefined") {
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLElement) {
          activeElement.blur();
        }
      }

      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const contentSizeClassMap: Record<
    NonNullable<ScrollableDialogProps["contentSize"]>,
    string
  > = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    full: "sm:max-w-[calc(100%-2rem)]",
  };
  const contentSizeClass = contentSizeClassMap[contentSize];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          contentSizeClass,
          maxWidthClass,
          maxHeightClass,
          "min-h-0 flex flex-col gap-0 overflow-hidden p-0",
        )}
      >
        <DialogHeader className="border-b p-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 overflow-y-auto px-6">
          <div className="py-4">{children}</div>
        </ScrollArea>

        {footerActions ? (
          <DialogActionRow className="shrink-0 bg-card px-6 pb-6">
            {footerActions}
          </DialogActionRow>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
