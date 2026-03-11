"use client";

import * as React from "react";
import { Button } from "@tbms/ui/components/button";
import { AlertTriangle } from "lucide-react";
import { cn } from "@tbms/ui/lib/utils";
import { logDevError } from "@tbms/ui/lib/logger";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogIcon,
  AlertDialogTitle,
} from "@tbms/ui/components/optics/alert-dialog";
import { InlineLoader } from "@tbms/ui/components/inline-loader";

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="gap-4">
          <AlertDialogIcon>
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full shrink-0",
                variant === "destructive"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary",
              )}
            >
              <AlertTriangle className="h-6 w-6" />
            </div>
          </AlertDialogIcon>

          <div className="space-y-1">
            <AlertDialogTitle className="text-xl font-bold">{title}</AlertDialogTitle>
            {typeof description === "string" ? (
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </AlertDialogDescription>
            ) : (
              <div className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </div>
            )}
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-3 sm:gap-3">
          <AlertDialogCancel disabled={isLoading} size="lg" className="flex-1">
            {cancelText}
          </AlertDialogCancel>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
            size="lg"
            className="flex-1"
          >
            {isLoading ? <InlineLoader label="Confirming action" /> : null}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
