"use client";

import type * as React from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

type ToastInput = Omit<ExternalToast, "description" | "action"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: ToastVariant;
};

type ToastUpdate = Partial<ToastInput>;

function notify({
  title,
  description,
  action,
  variant = "default",
  ...options
}: ToastInput): string | number {
  const message = title ?? "";
  const payload: ExternalToast = {
    ...options,
    description,
    action,
  };

  switch (variant) {
    case "destructive":
      return sonnerToast.error(message, payload);
    case "success":
      return sonnerToast.success(message, payload);
    case "warning":
      return sonnerToast.warning(message, payload);
    case "info":
      return sonnerToast.info(message, payload);
    default:
      return sonnerToast(message, payload);
  }
}

function toast(input: ToastInput) {
  const id = notify(input);

  const dismiss = () => {
    sonnerToast.dismiss(id);
  };

  const update = (next: ToastUpdate) => {
    const merged = {
      ...input,
      ...next,
      id,
    };

    sonnerToast.message(merged.title ?? "", {
      ...merged,
      description: merged.description,
      action: merged.action,
    });
  };

  return { id, dismiss, update };
}

function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  };
}

export { useToast, toast };
export type { ToastInput as Toast, ToastVariant };
