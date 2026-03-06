import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DialogActionRow } from "@/components/ui/form-layout";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size={contentSize}
        variant="flush"
        className={cn(maxWidthClass, maxHeightClass, "min-h-0 flex flex-col ")}
      >
        <DialogHeader variant="section">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <ScrollArea variant="dialogBody" className="overflow-y-auto">
          <div className="py-4">{children}</div>
        </ScrollArea>

        {footerActions ? (
          <DialogActionRow className="shrink-0 bg-popover px-6 pb-6">
            {footerActions}
          </DialogActionRow>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
