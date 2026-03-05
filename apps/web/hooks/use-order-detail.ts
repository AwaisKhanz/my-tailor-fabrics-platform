"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ordersApi } from "@/lib/api/orders";
import { employeesApi } from "@/lib/api/employees";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { Order, orderPaymentFormSchema, OrderStatus } from "@tbms/shared-types";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

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

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [employees, setEmployees] = useState<OrderEmployeeOption[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareData, setShareData] = useState<OrderShareData | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await ordersApi.getOrder(orderId);
      if (response.success) {
        setOrder(response.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Order not found",
        variant: "destructive",
      });
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  }, [orderId, router, toast]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await employeesApi.getEmployees({ limit: 100 });
      if (response.success) {
        setEmployees(response.data.data);
      }
    } catch {
      // Non-critical for page rendering.
    }
  }, []);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    void fetchOrder();
    void fetchEmployees();
  }, [orderId, fetchOrder, fetchEmployees]);

  const updateStatus = useCallback(
    async (status: OrderStatus) => {
      if (!order) {
        return;
      }

      setStatusLoading(true);
      try {
        await ordersApi.updateStatus(order.id, {
          status,
          note: `Moved to ${status}`,
        });
        toast({
          title: "Status Updated",
          description: `Order is now ${status}`,
        });
        await fetchOrder();
      } catch {
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        });
      } finally {
        setStatusLoading(false);
      }
    },
    [fetchOrder, order, toast],
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
        toast({
          title: "Validation error",
          description: getFirstZodErrorMessage(parsedResult.error),
          variant: "destructive",
        });
        return false;
      }

      const amount = Math.round(parsedResult.data.amount * 100);

      setProcessingPayment(true);
      try {
        await ordersApi.addPayment(order.id, {
          amount,
          note: parsedResult.data.note || "",
        });
        toast({ title: "Payment Added" });
        await fetchOrder();
        return true;
      } catch (err: unknown) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(err, "Failed to add payment"),
          variant: "destructive",
        });
        return false;
      } finally {
        setProcessingPayment(false);
      }
    },
    [fetchOrder, order, toast],
  );

  const generateShareLink = useCallback(async () => {
    if (!order) {
      return null;
    }

    setSharing(true);
    try {
      const response = await ordersApi.shareOrder(order.id);
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
    } finally {
      setSharing(false);
    }
  }, [order, toast]);

  const clearShareData = useCallback(() => {
    setShareData(null);
  }, []);

  return {
    loading,
    order,
    employees,
    statusLoading,
    processingPayment,
    sharing,
    shareData,
    fetchOrder,
    updateStatus,
    addPayment,
    generateShareLink,
    clearShareData,
  };
}
