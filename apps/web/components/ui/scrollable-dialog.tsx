import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { DialogActionRow } from "@/components/ui/form-layout"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ScrollableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footerActions: React.ReactNode;
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
  maxWidthClass = "sm:max-w-md",
  maxHeightClass = "max-h-[90vh]",
}: ScrollableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidthClass, maxHeightClass, "flex flex-col p-0 overflow-hidden")}>
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6">
          <div className="py-4">
            {children}
          </div>
        </ScrollArea>
        
        <DialogActionRow className="shrink-0 bg-muted/50 px-6 pb-6">
          {footerActions}
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  )
}
