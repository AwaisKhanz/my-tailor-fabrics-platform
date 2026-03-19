import type { OrderItem } from "@tbms/shared-types";
import { ConfirmDialog } from "@tbms/ui/components/confirm-dialog";
import { TaskAssignmentDialog } from "@/components/orders/task-assignment/task-assignment-dialog";
import { OrderPaymentDialog } from "@/components/orders/order-payment-dialog";
import { OrderShareDialog } from "@/components/orders/order-share-dialog";

interface OrderDetailDialogsProps {
  amount: string;
  confirmPaymentReversal: () => void;
  copyToClipboard: (value: string) => Promise<void>;
  closePaymentReversalDialog: () => void;
  employees: Array<{ id: string; fullName: string }>;
  handleAddPayment: () => Promise<void>;
  handlePaymentAmountChange: (value: string) => void;
  handlePaymentDialogChange: (open: boolean) => void;
  handlePaymentNoteChange: (value: string) => void;
  handleShareDialogChange: (open: boolean) => void;
  note: string;
  orderBalanceDue: number;
  orderNumber: string;
  paymentFieldErrors: {
    amount?: string;
    note?: string;
  };
  paymentOpen: boolean;
  paymentToReverseId: string | null;
  paymentValidationError: string | null;
  processingPayment: boolean;
  publicShareUrl: string | null;
  refreshOrder: () => Promise<void> | void;
  reversingPaymentId: string | null;
  setTaskOpen: (open: boolean) => void;
  shareData: { token: string; pin: string } | null;
  shareOpen: boolean;
  taskItem: OrderItem | null;
  taskOpen: boolean;
}

export function OrderDetailDialogs({
  amount,
  confirmPaymentReversal,
  copyToClipboard,
  closePaymentReversalDialog,
  employees,
  handleAddPayment,
  handlePaymentAmountChange,
  handlePaymentDialogChange,
  handlePaymentNoteChange,
  handleShareDialogChange,
  note,
  orderBalanceDue,
  orderNumber,
  paymentFieldErrors,
  paymentOpen,
  paymentToReverseId,
  paymentValidationError,
  processingPayment,
  publicShareUrl,
  refreshOrder,
  reversingPaymentId,
  setTaskOpen,
  shareData,
  shareOpen,
  taskItem,
  taskOpen,
}: OrderDetailDialogsProps) {
  return (
    <>
      <OrderPaymentDialog
        open={paymentOpen}
        onOpenChange={handlePaymentDialogChange}
        orderNumber={orderNumber}
        balanceDue={orderBalanceDue}
        amount={amount}
        note={note}
        processing={processingPayment}
        fieldErrors={paymentFieldErrors}
        validationError={paymentValidationError ?? ""}
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
        publicUrl={publicShareUrl ?? ""}
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
    </>
  );
}
