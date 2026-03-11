"use client";

import { useCallback, useMemo, useState } from "react";
import {
  OrderStatus,
  type PublicOrderStatusResult,
  publicStatusPinSchema,
} from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { usePublicOrderStatusLookup } from "@/hooks/queries/public-status-queries";

const PUBLIC_STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
  [OrderStatus.NEW]: AlertCircle,
  [OrderStatus.IN_PROGRESS]: Clock,
  [OrderStatus.READY]: CheckCircle2,
  [OrderStatus.OVERDUE]: AlertTriangle,
  [OrderStatus.DELIVERED]: Truck,
  [OrderStatus.COMPLETED]: CheckCircle2,
  [OrderStatus.CANCELLED]: AlertCircle,
};

interface UsePublicOrderStatusPageParams {
  token: string;
}

export function usePublicOrderStatusPage({
  token,
}: UsePublicOrderStatusPageParams) {
  const publicOrderStatusLookupMutation = usePublicOrderStatusLookup();
  const [pin, setPin] = useState("");
  const [order, setOrder] = useState<PublicOrderStatusResult | null>(null);
  const loading = publicOrderStatusLookupMutation.isPending;
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const verifyPin = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const parsedResult = publicStatusPinSchema.safeParse({ pin });
      if (!parsedResult.success) {
        setError(parsedResult.error.issues[0]?.message ?? "Invalid PIN.");
        return;
      }

      setError("");

      try {
        const { ok, payload } =
          await publicOrderStatusLookupMutation.mutateAsync({
            token,
            pin: parsedResult.data.pin,
          });
        if (!payload) {
          setError("Unexpected response received. Please try again.");
          return;
        }

        if (!ok || !payload.success) {
          setError(
            payload.message ??
              "Invalid PIN or link. Please check and try again.",
          );
          return;
        }

        setOrder(payload.data);
        setSubmitted(true);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    },
    [pin, publicOrderStatusLookupMutation, token],
  );

  const statusConfig = useMemo(() => {
    if (!order) {
      return null;
    }

    const status = order.status;
    const fallbackStatus = OrderStatus.NEW;
    const resolvedStatus = ORDER_STATUS_CONFIG[status]
      ? status
      : fallbackStatus;
    const statusConfig = ORDER_STATUS_CONFIG[resolvedStatus];

    return {
      label: statusConfig.publicLabel,
      variant: statusConfig.variant,
      icon: PUBLIC_STATUS_ICONS[resolvedStatus],
    };
  }, [order]);

  return {
    pin,
    order,
    loading,
    submitted,
    error,
    statusConfig,
    setPin,
    verifyPin,
  };
}
