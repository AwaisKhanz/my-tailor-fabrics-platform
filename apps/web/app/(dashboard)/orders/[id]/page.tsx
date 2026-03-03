"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useOrderDetail } from "@/hooks/use-order-detail";
import { OrderItem, OrderStatus } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskAssignmentDialog } from "./TaskAssignmentDialog";
import { formatDate } from "@/lib/utils";
import { OrderDetailBreadcrumb } from "@/components/orders/order-detail-breadcrumb";
import { OrderDetailHeaderCard } from "@/components/orders/order-detail-header-card";
import { OrderCustomerInsightCard } from "@/components/orders/order-customer-insight-card";
import { OrderItemsTable } from "@/components/orders/order-items-table";
import { OrderFinancialSummaryCard } from "@/components/orders/order-financial-summary-card";
import { OrderTimelineCard } from "@/components/orders/order-timeline-card";
import { OrderLifecycleCard } from "@/components/orders/order-lifecycle-card";
import { OrderPaymentDialog } from "@/components/orders/order-payment-dialog";
import { OrderShareDialog } from "@/components/orders/order-share-dialog";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const orderId = typeof params.id === "string" ? params.id : null;
  const {
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
  } = useOrderDetail(orderId);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskItem, setTaskItem] = useState<OrderItem | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const handleAddPayment = async () => {
    const success = await addPayment(amount, note);
    if (!success) {
      return;
    }

    setPaymentOpen(false);
    setAmount("");
    setNote("");
  };

  const handleShareStatus = async () => {
    const result = await generateShareLink();
    if (result) {
      setShareOpen(true);
    }
  };

  const handleShareDialogChange = (open: boolean) => {
    setShareOpen(open);
    if (!open) {
      clearShareData();
    }
  };

  const copyToClipboard = async (text: string) => {
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
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status] ?? {
    label: order.status,
    variant: "outline",
  };

  const canCancel =
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.COMPLETED;

  const publicShareUrl =
    shareData && typeof window !== "undefined"
      ? `${window.location.origin}/status/${shareData.token}`
      : "";

  return (
    <div className="mx-auto max-w-9xl space-y-6">
      <OrderDetailBreadcrumb
        orderNumber={order.orderNumber}
        onBack={() => router.push("/orders")}
      />

      <OrderDetailHeaderCard
        orderNumber={order.orderNumber}
        statusLabel={statusConfig.label}
        statusVariant={statusConfig.variant}
        createdAtLabel={formatDate(order.createdAt)}
        dueDateLabel={formatDate(order.dueDate)}
        canCancel={canCancel}
        sharing={sharing}
        statusLoading={statusLoading}
        onPrintReceipt={() =>
          window.open(`${API_BASE_URL}/orders/${order.id}/receipt`, "_blank")
        }
        onShareStatus={() => {
          void handleShareStatus();
        }}
        onCancelOrder={() => {
          void updateStatus(OrderStatus.CANCELLED);
        }}
        onEditOrder={() => router.push(`/orders/new?edit=${order.id}`)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <OrderCustomerInsightCard customer={order.customer} />

          <OrderItemsTable
            items={order.items}
            employees={employees}
            onManageTasks={(item) => {
              setTaskItem(item);
              setTaskOpen(true);
            }}
          />
        </div>

        <div className="space-y-6">
          <OrderFinancialSummaryCard
            order={order}
            onCapturePayment={() => setPaymentOpen(true)}
          />

          <OrderTimelineCard
            status={order.status}
            history={order.statusHistory ?? []}
          />

          <OrderLifecycleCard
            status={order.status}
            statusLoading={statusLoading}
            onAdvance={(status) => {
              void updateStatus(status);
            }}
          />
        </div>
      </div>

      <OrderPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        orderNumber={order.orderNumber}
        balanceDue={order.balanceDue}
        amount={amount}
        note={note}
        processing={processingPayment}
        onAmountChange={setAmount}
        onNoteChange={setNote}
        onSubmit={() => {
          void handleAddPayment();
        }}
      />

      <TaskAssignmentDialog
        orderItem={taskItem}
        employees={employees}
        onSuccess={() => {
          void fetchOrder();
        }}
        open={taskOpen}
        onOpenChange={setTaskOpen}
      />

      <OrderShareDialog
        open={shareOpen}
        onOpenChange={handleShareDialogChange}
        shareData={shareData}
        publicUrl={publicShareUrl}
        onCopy={(value) => {
          void copyToClipboard(value);
        }}
      />
    </div>
  );
}
