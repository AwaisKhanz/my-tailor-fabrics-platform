"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, CircleDollarSign, Package, TimerReset, UserCog } from "lucide-react";
import { OrderStatus } from "@tbms/shared-types";
import { TaskAssignmentDialog } from "@/components/orders/task-assignment/task-assignment-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DetailSplit, PageShell, PageSection } from "@/components/ui/page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderCustomerInsightCard } from "@/components/orders/order-customer-insight-card";
import { OrderDetailBreadcrumb } from "@/components/orders/order-detail-breadcrumb";
import { OrderDetailHeaderCard } from "@/components/orders/order-detail-header-card";
import { OrderFinancialSummaryCard } from "@/components/orders/order-financial-summary-card";
import { OrderItemsTable } from "@/components/orders/order-items-table";
import { OrderLifecycleCard } from "@/components/orders/order-lifecycle-card";
import { OrderPaymentDialog } from "@/components/orders/order-payment-dialog";
import { OrderShareDialog } from "@/components/orders/order-share-dialog";
import { OrderTimelineCard } from "@/components/orders/order-timeline-card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";
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
  } = useOrderDetailPage(orderId);

  if (loading) {
    return (
      <PageShell>
        <PageSection spacing="compact">
          <div className="space-y-4">
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
  const canEditAction = canAll([PERMISSION["orders.update"]]);
  const canShareAction = canAll([PERMISSION["orders.share"]]);
  const canCancelAction = canAll([PERMISSION["orders.cancel"]]);
  const canPrintReceipt = canAll([PERMISSION["orders.receipt"]]);
  const canCapturePayment = canAll([PERMISSION["payments.manage"]]);
  const canManageTasks = canAll([PERMISSION["tasks.assign"]]);

  return (
    <PageShell>
      <PageSection spacing="compact">
        <OrderDetailBreadcrumb
          orderNumber={order.orderNumber}
          onBack={() => router.push(ORDERS_ROUTE)}
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
          onCancelOrder={handleCancelOrder}
          onEditOrder={() => router.push(buildEditOrderRoute(order.id))}
        />
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="four" flushSectionSpacing>
          <StatCard
            title="Pieces"
            subtitle="Order volume"
            value={totalPieces}
            icon={<Package className="h-4 w-4" />}
            iconTone="primary"
            valueClassName="text-2xl"
            className="h-full"
            contentClassName="p-5"
          />
          <StatCard
            title="Assigned Employees"
            subtitle="Active assignees"
            value={assignedTailorsCount}
            icon={<UserCog className="h-4 w-4" />}
            iconTone="info"
            valueClassName="text-2xl"
            className="h-full"
            contentClassName="p-5"
          />
          <StatCard
            title="Active Tasks"
            subtitle="In production"
            value={totalTaskCount}
            icon={<TimerReset className="h-4 w-4" />}
            iconTone="warning"
            valueClassName="text-2xl"
            className="h-full"
            contentClassName="p-5"
          />
          <StatCard
            title="Balance Due"
            subtitle="Outstanding amount"
            value={formatPKR(order.balanceDue)}
            icon={<CircleDollarSign className="h-4 w-4" />}
            iconTone="destructive"
            valueTone="destructive"
            valueClassName="text-2xl"
            className="h-full"
            contentClassName="p-5"
          />
        </StatsGrid>
      </PageSection>

      <PageSection>
        <DetailSplit
          ratio="3-2"
          main={
            <div className="space-y-6">
              <OrderCustomerInsightCard customer={order.customer} />

              <OrderItemsTable
                items={order.items}
                canManageTasks={canManageTasks}
                onManageTasks={handleManageTasks}
              />
            </div>
          }
          side={
            <div className="space-y-6">
              <OrderFinancialSummaryCard
                order={order}
                canCapturePayment={canCapturePayment}
                canReversePayment={canCapturePayment}
                reversingPaymentId={reversingPaymentId}
                onCapturePayment={openPaymentDialog}
                onReversePayment={requestPaymentReversal}
              />

              <OrderLifecycleCard
                status={order.status}
                statusLoading={statusLoading}
                onAdvance={handleAdvanceStatus}
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
        onOpenChange={handlePaymentDialogChange}
        orderNumber={order.orderNumber}
        balanceDue={order.balanceDue}
        amount={amount}
        note={note}
        processing={processingPayment}
        fieldErrors={paymentFieldErrors}
        validationError={paymentValidationError}
        onAmountChange={handlePaymentAmountChange}
        onNoteChange={handlePaymentNoteChange}
        onSubmit={() => {
          void handleAddPayment();
        }}
      />

      <TaskAssignmentDialog
        orderItem={taskItem}
        employees={employees}
        onSuccess={refreshOrder}
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

      <ConfirmDialog
        open={Boolean(paymentToReverseId)}
        onOpenChange={(open) => {
          if (!open) {
            closePaymentReversalDialog();
          }
        }}
        title="Reverse this payment?"
        description="This will create a reversal audit entry and restore the order balance."
        onConfirm={confirmPaymentReversal}
        confirmText="Reverse Payment"
        variant="destructive"
        loading={Boolean(
          paymentToReverseId && reversingPaymentId === paymentToReverseId,
        )}
      />
    </PageShell>
  );
}
