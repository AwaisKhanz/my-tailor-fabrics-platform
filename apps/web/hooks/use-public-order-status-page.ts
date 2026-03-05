"use client";

import { useCallback, useMemo, useState } from "react";
import {
  OrderStatus,
  publicStatusPinSchema,
  type Order,
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

const PUBLIC_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.NEW]: "New",
  [OrderStatus.IN_PROGRESS]: "In Progress",
  [OrderStatus.READY]: "Ready for Pickup",
  [OrderStatus.OVERDUE]: "Overdue",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.COMPLETED]: "Completed",
  [OrderStatus.CANCELLED]: "Cancelled",
};

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

export function usePublicOrderStatusPage({ token }: UsePublicOrderStatusPageParams) {
  const [pin, setPin] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
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

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/status/${token}?pin=${parsedResult.data.pin}`,
        );
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          setError(payload.message ?? "Invalid PIN or link. Please check and try again.");
          return;
        }

        setOrder(payload.data as Order);
        setSubmitted(true);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [pin, token],
  );

  const statusConfig = useMemo(() => {
    if (!order) {
      return null;
    }

    const status = order.status as OrderStatus;
    const fallbackStatus = OrderStatus.NEW;
    const resolvedStatus = ORDER_STATUS_CONFIG[status] ? status : fallbackStatus;

    return {
      label: PUBLIC_STATUS_LABELS[resolvedStatus],
      variant: ORDER_STATUS_CONFIG[resolvedStatus].variant,
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
