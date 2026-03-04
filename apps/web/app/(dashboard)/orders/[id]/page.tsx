"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, CircleDollarSign, Package, TimerReset, UserCog } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { useToast } from "@/hooks/use-toast";
import { useOrderDetail } from "@/hooks/use-order-detail";
import { OrderItem, OrderStatus } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskAssignmentDialog } from "./TaskAssignmentDialog";
import { formatDate, formatPKR } from "@/lib/utils";
import { OrderDetailBreadcrumb } from "@/components/orders/order-detail-breadcrumb";
import { OrderDetailHeaderCard } from "@/components/orders/order-detail-header-card";
import { OrderCustomerInsightCard } from "@/components/orders/order-customer-insight-card";
import { OrderItemsTable } from "@/components/orders/order-items-table";
import { OrderFinancialSummaryCard } from "@/components/orders/order-financial-summary-card";
import { OrderTimelineCard } from "@/components/orders/order-timeline-card";
import { OrderLifecycleCard } from "@/components/orders/order-lifecycle-card";
import { OrderPaymentDialog } from "@/components/orders/order-payment-dialog";
import { OrderShareDialog } from "@/components/orders/order-share-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { DetailSplit, PageShell, PageSection } from "@/components/ui/page-shell";
import { useAuthz } from "@/hooks/use-authz";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { canAll } = useAuthz();
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
      <PageShell>
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageShell>
    );
  }

  if (!order) {
    return (
      <PageShell>
        <EmptyState
          icon={AlertCircle}
          title="Order not found"
          description="The requested order is unavailable or may have been removed."
          action={{
            label: "Back to Orders",
            onClick: () => router.push("/orders"),
          }}
        />
      </PageShell>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status] ?? {
    label: order.status,
    variant: "outline",
  };

  const canCancel =
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.COMPLETED;
  const canEditAction = canAll(["orders.update"]);
  const canShareAction = canAll(["orders.share"]);
  const canCancelAction = canAll(["orders.cancel"]);
  const canPrintReceipt = canAll(["orders.receipt"]);
  const canCapturePayment = canAll(["payments.manage"]);
  const canManageTasks = canAll(["tasks.assign"]);

  const publicShareUrl =
    shareData && typeof window !== "undefined"
      ? `${window.location.origin}/status/${shareData.token}`
      : "";

  const totalPieces = order.items.reduce(
    (sum, item) => sum + Math.max(item.quantity ?? 1, 1),
    0,
  );
  const assignedTailorsCount = new Set(
    order.items.map((item) => item.employeeId).filter(Boolean),
  ).size;
  const totalTaskCount = order.items.reduce(
    (sum, item) => sum + (item.tasks?.length ?? 0),
    0,
  );

  const handlePrintReceipt = async () => {
    try {
      const receiptBlob = await ordersApi.getReceiptPdf(order.id);
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
  };

  return (
    <PageShell>
      <PageSection spacing="compact">
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
          canEditAction={canEditAction}
          canPrintReceipt={canPrintReceipt}
          canShareAction={canShareAction}
          canCancelAction={canCancelAction}
          sharing={sharing}
          statusLoading={statusLoading}
          onPrintReceipt={() => {
            void handlePrintReceipt();
          }}
          onShareStatus={() => {
            void handleShareStatus();
          }}
          onCancelOrder={() => {
            void updateStatus(OrderStatus.CANCELLED);
          }}
          onEditOrder={() => router.push(`/orders/new?edit=${order.id}`)}
        />
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid auto-rows-fr space-y-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Card className="border-border/70 bg-card/95">
          <CardContent spacing="section" className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Pieces</Label>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{totalPieces}</p>
              </div>
              <div className="rounded-lg bg-primary/15 p-2">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/95">
          <CardContent spacing="section" className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Assigned Tailors</Label>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{assignedTailorsCount}</p>
              </div>
              <div className="rounded-lg bg-info/15 p-2">
                <UserCog className="h-4 w-4 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/95">
          <CardContent spacing="section" className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Active Tasks</Label>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{totalTaskCount}</p>
              </div>
              <div className="rounded-lg bg-warning/15 p-2">
                <TimerReset className="h-4 w-4 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/95">
          <CardContent spacing="section" className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Balance Due</Label>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-destructive">{formatPKR(order.balanceDue)}</p>
              </div>
              <div className="rounded-lg bg-destructive/15 p-2">
                <CircleDollarSign className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      <PageSection>
        <DetailSplit
          ratio="3-2"
          main={
            <div className="space-y-6">
              <OrderCustomerInsightCard customer={order.customer} />

              <OrderItemsTable
                items={order.items}
                employees={employees}
                canManageTasks={canManageTasks}
                onManageTasks={(item) => {
                  setTaskItem(item);
                  setTaskOpen(true);
                }}
              />
            </div>
          }
          side={
            <div className="space-y-6">
              <OrderFinancialSummaryCard
                order={order}
                canCapturePayment={canCapturePayment}
                onCapturePayment={() => setPaymentOpen(true)}
              />

              <OrderLifecycleCard
                status={order.status}
                statusLoading={statusLoading}
                onAdvance={(status) => {
                  void updateStatus(status);
                }}
              />

              <OrderTimelineCard
                status={order.status}
                history={order.statusHistory ?? []}
              />
            </div>
          }
        />
      </PageSection>

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
    </PageShell>
  );
}

export default withRoleGuard(OrderDetailPage, { all: ["orders.read"] });
