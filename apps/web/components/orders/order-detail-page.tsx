"use client";

import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { OrderStatus } from "@tbms/shared-types";
import { PageShell, PageSection } from "@tbms/ui/components/page-shell";
import { EmptyState } from "@tbms/ui/components/empty-state";
import { OrderCustomerInsightCard } from "@/components/orders/order-customer-insight-card";
import { OrderDetailBreadcrumb } from "@/components/orders/order-detail-breadcrumb";
import { OrderDetailDialogs } from "@/components/orders/order-detail-dialogs";
import { OrderDetailHeaderCard } from "@/components/orders/order-detail-header-card";
import { OrderFinancialSummaryCard } from "@/components/orders/order-financial-summary-card";
import { OrderItemsTable } from "@/components/orders/order-items-table";
import { OrderLifecycleCard } from "@/components/orders/order-lifecycle-card";
import { OrderTimelineCard } from "@/components/orders/order-timeline-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { Skeleton } from "@tbms/ui/components/skeleton";
import { LoadingState } from "@tbms/ui/components/loading-state";
import { useAuthz } from "@/hooks/use-authz";
import { useOrderDetailPage } from "@/hooks/use-order-detail-page";
import { buildEditOrderRoute, ORDERS_ROUTE } from "@/lib/order-routes";
import { formatDate, formatPKR } from "@/lib/utils";
import { PERMISSION } from "@tbms/shared-constants";

type OrderDetailPageProps = {
  orderId: string;
};

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canEditAction = canAll([PERMISSION["orders.update"]]);
  const canShareAction = canAll([PERMISSION["orders.share"]]);
  const canCancelAction = canAll([PERMISSION["orders.cancel"]]);
  const canPrintReceipt = canAll([PERMISSION["orders.receipt"]]);
  const canCapturePayment = canAll([PERMISSION["payments.manage"]]);
  const canManageTasks = canAll([PERMISSION["tasks.assign"]]);
  const {
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
    paymentOpen,
    openPaymentDialog,
    amount,
    note,
    handlePaymentDialogChange,
    handlePaymentAmountChange,
    handlePaymentNoteChange,
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
  } = useOrderDetailPage(orderId, { canManageTasks });

  if (loading) {
    return (
      <PageShell>
        <PageSection spacing="compact">
          <div className="space-y-4">
            <LoadingState
              compact
              text="Loading order..."
              caption="Gathering order details and tasks."
            />
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </PageSection>
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
            onClick: () => router.push(ORDERS_ROUTE),
          }}
        />
      </PageShell>
    );
  }

  if (!statusConfig) {
    throw new Error("Missing order status config for loaded order");
  }

  const canCancel =
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.COMPLETED;
  return (
    <PageShell>
      <PageSection spacing="compact">
        <OrderDetailBreadcrumb
          orderNumber={order.orderNumber}
          onBack={() => router.push(ORDERS_ROUTE)}
        />

        <OrderDetailHeaderCard
          status={order.status}
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
          onCancelOrder={handleCancelOrder}
          onEditOrder={() => router.push(buildEditOrderRoute(order.id))}
        />
      </PageSection>

      <PageSection spacing="compact">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pieces</CardDescription>
              <CardTitle className="text-3xl">{totalPieces}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Order volume</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Assigned Employees</CardDescription>
              <CardTitle className="text-3xl">{assignedTailorsCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Active assignees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Tasks</CardDescription>
              <CardTitle className="text-3xl">{totalTaskCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">In production</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Balance Due</CardDescription>
              <CardTitle className="text-3xl">{formatPKR(order.balanceDue)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Outstanding amount</p>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      <PageSection>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5 xl:items-stretch">
          <div className="xl:col-span-3">
            <OrderCustomerInsightCard customer={order.customer} className="h-full" />
          </div>

          <div className="xl:col-span-2">
            <OrderFinancialSummaryCard
              order={order}
              className="h-full"
              canCapturePayment={canCapturePayment}
              canReversePayment={canCapturePayment}
              reversingPaymentId={reversingPaymentId}
              onCapturePayment={openPaymentDialog}
              onReversePayment={requestPaymentReversal}
            />
          </div>

          <div className="xl:col-span-3">
            <OrderItemsTable
              items={order.items}
              className="h-full"
              canManageTasks={canManageTasks}
              onManageTasks={handleManageTasks}
            />
          </div>

          <div className="xl:col-span-2">
            <OrderLifecycleCard
              status={order.status}
              statusLoading={statusLoading}
              onAdvance={handleAdvanceStatus}
            />
          </div>

          <div className="xl:col-span-5">
            <OrderTimelineCard
              status={order.status}
              history={order.statusHistory ?? []}
            />
          </div>
        </div>
      </PageSection>

      <OrderDetailDialogs
        amount={amount}
        confirmPaymentReversal={confirmPaymentReversal}
        copyToClipboard={copyToClipboard}
        closePaymentReversalDialog={closePaymentReversalDialog}
        employees={employees}
        handleAddPayment={handleAddPayment}
        handlePaymentAmountChange={handlePaymentAmountChange}
        handlePaymentDialogChange={handlePaymentDialogChange}
        handlePaymentNoteChange={handlePaymentNoteChange}
        handleShareDialogChange={handleShareDialogChange}
        note={note}
        orderBalanceDue={order.balanceDue}
        orderNumber={order.orderNumber}
        paymentFieldErrors={paymentFieldErrors}
        paymentOpen={paymentOpen}
        paymentToReverseId={paymentToReverseId}
        paymentValidationError={paymentValidationError}
        processingPayment={processingPayment}
        publicShareUrl={publicShareUrl}
        refreshOrder={refreshOrder}
        reversingPaymentId={reversingPaymentId}
        setTaskOpen={setTaskOpen}
        shareData={shareData}
        shareOpen={shareOpen}
        taskItem={taskItem}
        taskOpen={taskOpen}
      />
    </PageShell>
  );
}
