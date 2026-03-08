"use client";

import { useCallback, useState } from "react";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { type OrderItem, OrderStatus } from "@tbms/shared-types";
import { ordersApi } from "@/lib/api/orders";
import { useOrderDetail } from "@/hooks/use-order-detail";
import { useToast } from "@/hooks/use-toast";

export function useOrderDetailPage(orderId: string) {
  const { toast } = useToast();
  const orderDetail = useOrderDetail(orderId);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskItem, setTaskItem] = useState<OrderItem | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [paymentToReverseId, setPaymentToReverseId] = useState<string | null>(
    null,
  );

  const handleAddPayment = useCallback(async () => {
    const success = await orderDetail.addPayment(amount, note);
    if (!success) {
      return;
    }

    setPaymentOpen(false);
    setAmount("");
    setNote("");
  }, [amount, note, orderDetail]);

  const refreshOrder = useCallback(() => {
    void orderDetail.fetchOrder();
  }, [orderDetail]);

  const handleShareStatus = useCallback(async () => {
    const result = await orderDetail.generateShareLink();
    if (result) {
      setShareOpen(true);
    }
  }, [orderDetail]);

  const handleShareDialogChange = useCallback(
    (open: boolean) => {
      setShareOpen(open);
      if (!open) {
        orderDetail.clearShareData();
      }
    },
    [orderDetail],
  );

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard" });
      } catch {
        toast({
          title: "Error",
          description: "Failed to copy text",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const handlePrintReceipt = useCallback(async () => {
    if (!orderDetail.order) {
      return;
    }

    try {
      const receiptBlob = await ordersApi.getReceiptPdf(orderDetail.order.id);
      const receiptUrl = window.URL.createObjectURL(receiptBlob);
      window.open(receiptUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => {
        window.URL.revokeObjectURL(receiptUrl);
      }, 60_000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate receipt",
        variant: "destructive",
      });
    }
  }, [orderDetail.order, toast]);

  const requestPaymentReversal = useCallback((paymentId: string) => {
    setPaymentToReverseId(paymentId);
  }, []);

  const closePaymentReversalDialog = useCallback(() => {
    setPaymentToReverseId(null);
  }, []);

  const confirmPaymentReversal = useCallback(async () => {
    if (!paymentToReverseId) {
      return;
    }

    const success = await orderDetail.reversePayment(paymentToReverseId);
    if (success) {
      setPaymentToReverseId(null);
    }
  }, [orderDetail, paymentToReverseId]);

  const handleCancelOrder = useCallback(() => {
    void orderDetail.updateStatus(OrderStatus.CANCELLED);
  }, [orderDetail]);

  const handleAdvanceStatus = useCallback(
    (status: OrderStatus) => {
      void orderDetail.updateStatus(status);
    },
    [orderDetail],
  );

  const handleManageTasks = useCallback((item: OrderItem) => {
    setTaskItem(item);
    setTaskOpen(true);
  }, []);

  const statusConfig = orderDetail.order
    ? ORDER_STATUS_CONFIG[orderDetail.order.status] ?? {
        label: orderDetail.order.status,
        variant: "outline" as const,
      }
    : null;

  const totalPieces =
    orderDetail.order?.items.reduce(
      (sum, item) => sum + Math.max(item.quantity ?? 1, 1),
      0,
    ) ?? 0;
  const assignedTailorsCount =
    orderDetail.order
      ? new Set(
          orderDetail.order.items.flatMap((item) =>
            (item.tasks ?? [])
              .map((task) => task.assignedEmployeeId)
              .filter((value): value is string => Boolean(value)),
          ),
        ).size
      : 0;
  const totalTaskCount =
    orderDetail.order?.items.reduce(
      (sum, item) => sum + (item.tasks?.length ?? 0),
      0,
    ) ?? 0;
  const publicShareUrl =
    orderDetail.shareData && typeof window !== "undefined"
      ? `${window.location.origin}/status/${orderDetail.shareData.token}`
      : "";

  return {
    ...orderDetail,
    paymentOpen,
    setPaymentOpen,
    amount,
    setAmount,
    note,
    setNote,
    taskOpen,
    setTaskOpen,
    taskItem,
    shareOpen,
    handleAddPayment,
    refreshOrder,
    handleShareStatus,
    handleShareDialogChange,
    copyToClipboard,
    handlePrintReceipt,
    paymentToReverseId,
    requestPaymentReversal,
    closePaymentReversalDialog,
    confirmPaymentReversal,
    handleCancelOrder,
    handleAdvanceStatus,
    handleManageTasks,
    statusConfig,
    totalPieces,
    assignedTailorsCount,
    totalTaskCount,
    publicShareUrl,
  };
}
