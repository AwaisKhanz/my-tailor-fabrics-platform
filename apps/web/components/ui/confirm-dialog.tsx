"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogActionRow } from "@/components/ui/form-layout";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { logDevError } from "@/lib/logger";

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
      logDevError("Confirmation error:", error);
    } finally {
      setIsPending(false);
    }
  };

  const isLoading = loading || isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" variant="flush">
        <div className={cn(
          "h-2 w-full",
          variant === "destructive" ? "bg-destructive" : "bg-primary"
        )} />
        
        <div className="p-6">
          <DialogHeader className="gap-3">
            <div className={cn(
               "flex h-12 w-12 items-center justify-center rounded-full shrink-0",
               variant === "destructive" ? "bg-error-muted text-destructive" : "bg-sidebar-active text-primary"
            )}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
              {typeof description === "string" ? (
                <DialogDescription className="text-[15px] leading-relaxed text-text-secondary">
                  {description}
                </DialogDescription>
              ) : (
                <div className="text-[15px] leading-relaxed text-text-secondary">
                  {description}
                </div>
              )}
            </div>
          </DialogHeader>

          <DialogActionRow className="mt-8 gap-3 sm:space-x-0" bordered={false}>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              size="lg"
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "premium"}
              onClick={handleConfirm}
              disabled={isLoading}
              size="lg"
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
          </DialogActionRow>
        </div>
      </DialogContent>
    </Dialog>
  );
}
