"use client";

import { useCallback, useMemo, useState } from "react";
import {
  type ApiResponse,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isPublicStatusResponse(
  value: unknown,
): value is ApiResponse<PublicOrderStatusResult | null> {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.success === "boolean" && "data" in value;
}

export function usePublicOrderStatusPage({ token }: UsePublicOrderStatusPageParams) {
  const [pin, setPin] = useState("");
  const [order, setOrder] = useState<PublicOrderStatusResult | null>(null);
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
        const payloadRaw: unknown = await response.json();
        if (!isPublicStatusResponse(payloadRaw)) {
          setError("Unexpected response received. Please try again.");
          return;
        }

        const payload = payloadRaw;

        if (!response.ok || !payload.success) {
          setError(payload.message ?? "Invalid PIN or link. Please check and try again.");
          return;
        }

        setOrder(payload.data);
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

    const status = order.status;
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
