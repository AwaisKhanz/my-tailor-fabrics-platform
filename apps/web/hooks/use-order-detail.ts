"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { Order, orderPaymentFormSchema, OrderStatus } from "@tbms/shared-types";
import { ORDERS_ROUTE } from "@/lib/order-routes";
import {
  useAddOrderPayment,
  useOrder,
  useReverseOrderPayment,
  useShareOrder,
  useUpdateOrderStatus,
} from "@/hooks/queries/order-queries";
import { useEmployeesDropdown } from "@/hooks/queries/employee-queries";

export interface OrderEmployeeOption {
  id: string;
  fullName: string;
}

export interface OrderShareData {
  token: string;
  pin: string;
}

export function useOrderDetail(orderId: string | null) {
  const router = useRouter();
  const { toast } = useToast();

  const orderQuery = useOrder(orderId);
  const employeesQuery = useEmployeesDropdown();
  const updateStatusMutation = useUpdateOrderStatus();
  const addPaymentMutation = useAddOrderPayment();
  const reversePaymentMutation = useReverseOrderPayment();
  const shareOrderMutation = useShareOrder();

  const [paymentFieldErrors, setPaymentFieldErrors] = useState<{
    amount?: string;
    note?: string;
  }>({});
  const [paymentValidationError, setPaymentValidationError] = useState("");
  const [reversingPaymentId, setReversingPaymentId] = useState<string | null>(
    null,
  );
  const [shareData, setShareData] = useState<OrderShareData | null>(null);

  const loading = orderQuery.isLoading;
  const order: Order | null = orderQuery.data?.success
    ? orderQuery.data.data
    : null;
  const employees: OrderEmployeeOption[] = employeesQuery.data?.success
    ? employeesQuery.data.data.data
    : [];
  const statusLoading = updateStatusMutation.isPending;
  const processingPayment = addPaymentMutation.isPending;
  const sharing = shareOrderMutation.isPending;

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      return;
    }

    try {
      await orderQuery.refetch();
    } catch {
      toast({
        title: "Error",
        description: "Order not found",
        variant: "destructive",
      });
      router.push(ORDERS_ROUTE);
    }
  }, [orderId, orderQuery, router, toast]);

  useEffect(() => {
    if (!orderId || !orderQuery.isError) {
      return;
    }

    toast({
      title: "Error",
      description: "Order not found",
      variant: "destructive",
    });
    router.push(ORDERS_ROUTE);
  }, [orderId, orderQuery.isError, router, toast]);

  const updateStatus = useCallback(
    async (status: OrderStatus) => {
      if (!order) {
        return;
      }

      try {
        await updateStatusMutation.mutateAsync({
          id: order.id,
          data: {
            status,
            note: `Moved to ${status}`,
          },
        });
        toast({
          title: "Status Updated",
          description: `Order is now ${status}`,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        });
      }
    },
    [order, toast, updateStatusMutation],
  );

  const addPayment = useCallback(
    async (amountInput: string, note: string) => {
      if (!order) {
        return false;
      }

      const parsedResult = orderPaymentFormSchema.safeParse({
        amount: amountInput,
        note,
      });

      if (!parsedResult.success) {
        const flattenedErrors = parsedResult.error.flatten().fieldErrors;
        setPaymentFieldErrors({
          amount: flattenedErrors.amount?.[0],
          note: flattenedErrors.note?.[0],
        });
        setPaymentValidationError(
          flattenedErrors.amount?.[0] ??
            flattenedErrors.note?.[0] ??
            "Fix the highlighted fields and try again.",
        );
        return false;
      }

      setPaymentFieldErrors({});
      setPaymentValidationError("");
      try {
        await addPaymentMutation.mutateAsync({
          orderId: order.id,
          data: {
            amount: parsedResult.data.amount,
            note: parsedResult.data.note || "",
          },
        });
        toast({ title: "Payment Added" });
        return true;
      } catch (err: unknown) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            err,
            "Failed to add payment",
          ),
          variant: "destructive",
        });
        return false;
      }
    },
    [addPaymentMutation, order, toast],
  );

  const reversePayment = useCallback(
    async (paymentId: string, note?: string) => {
      if (!order) {
        return false;
      }

      setReversingPaymentId(paymentId);
      try {
        await reversePaymentMutation.mutateAsync({
          orderId: order.id,
          paymentId,
          data: {
            note: note?.trim() || undefined,
          },
        });
        toast({ title: "Payment Reversed" });
        return true;
      } catch (err: unknown) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            err,
            "Failed to reverse payment",
          ),
          variant: "destructive",
        });
        return false;
      } finally {
        setReversingPaymentId(null);
      }
    },
    [order, reversePaymentMutation, toast],
  );

  const generateShareLink = useCallback(async () => {
    if (!order) {
      return null;
    }

    try {
      const response = await shareOrderMutation.mutateAsync(order.id);
      if (!response.success) {
        return null;
      }

      const data: OrderShareData = response.data;
      setShareData(data);
      return data;
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      });
      return null;
    }
  }, [order, shareOrderMutation, toast]);

  const clearShareData = useCallback(() => {
    setShareData(null);
  }, []);

  return {
    loading,
    order,
    employees,
    statusLoading,
    processingPayment,
    paymentFieldErrors,
    paymentValidationError,
    reversingPaymentId,
    sharing,
    shareData,
    fetchOrder,
    updateStatus,
    addPayment,
    clearPaymentValidation: () => {
      setPaymentFieldErrors({});
      setPaymentValidationError("");
    },
    reversePayment,
    generateShareLink,
    clearShareData,
  };
}
