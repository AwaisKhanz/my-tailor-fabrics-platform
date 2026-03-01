"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  loading = false,
}: ConfirmDialogProps) {
  const [isPending, setIsPending] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setIsPending(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Confirmation error:", error);
    } finally {
      setIsPending(false);
    }
  };

  const isLoading = loading || isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 border-none shadow-2xl">
        <div className={cn(
          "h-2 w-full",
          variant === "destructive" ? "bg-destructive" : "bg-primary"
        )} />
        
        <div className="p-6">
          <DialogHeader className="gap-3">
            <div className={cn(
               "flex h-12 w-12 items-center justify-center rounded-full shrink-0",
               variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            )}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
              {typeof description === "string" ? (
                <DialogDescription className="text-muted-foreground text-[15px] leading-relaxed">
                  {description}
                </DialogDescription>
              ) : (
                <div className="text-muted-foreground text-[15px] leading-relaxed">
                  {description}
                </div>
              )}
            </div>
          </DialogHeader>

          <DialogFooter className="mt-8 gap-3 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              size="xl"
              className="flex-1 font-semibold border-border/50 hover:bg-muted/50 transition-colors"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "premium"}
              onClick={handleConfirm}
              disabled={isLoading}
              size="xl"
              className="flex-1 font-semibold shadow-sm transition-all active:scale-95"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
