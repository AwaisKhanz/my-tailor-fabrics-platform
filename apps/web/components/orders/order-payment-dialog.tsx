import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogActionRow,
  DialogFormActions,
  DialogSection,
  FormStack,
} from "@/components/ui/form-layout";
import { FieldError, FieldLabel, FieldStack } from "@/components/ui/field";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { formatPKR } from "@/lib/utils";

interface OrderPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  balanceDue: number;
  amount: string;
  note: string;
  processing: boolean;
  fieldErrors: {
    amount?: string;
    note?: string;
  };
  validationError: string;
  onAmountChange: (amount: string) => void;
  onNoteChange: (note: string) => void;
  onSubmit: () => void;
}

export function OrderPaymentDialog({
  open,
  onOpenChange,
  orderNumber,
  balanceDue,
  amount,
  note,
  processing,
  fieldErrors,
  validationError,
  onAmountChange,
  onNoteChange,
  onSubmit,
}: OrderPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Capture Receipt</DialogTitle>
          <DialogDescription>
            Input financial deposit for Order <strong>#{orderNumber}</strong>.
          </DialogDescription>
        </DialogHeader>

        <DialogSection>
          <FormStack
            as="form"
            id="order-payment-form"
            density="relaxed"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            {validationError ? (
              <FieldError size="sm">{validationError}</FieldError>
            ) : null}
            <InfoTile
              tone="secondary"
              radius="xl"
              layout="between"
              padding="none"
              className="px-5 py-4"
            >
              <FieldLabel size="compact">Pending amount</FieldLabel>
              <span className="text-xl font-bold tabular-nums text-foreground">
                {formatPKR(balanceDue)}
              </span>
            </InfoTile>

            <FieldStack>
              <FieldLabel size="compact" tone="foreground">
                Deposit Amount (Rs.) <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                type="number"
                className="h-12 text-lg font-bold"
                placeholder="e.g. 1000"
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
                max={balanceDue / 100}
              />
              {fieldErrors.amount ? (
                <FieldError>{fieldErrors.amount}</FieldError>
              ) : null}
            </FieldStack>

            <FieldStack>
              <FieldLabel size="compact" tone="foreground">
                Transaction Note
              </FieldLabel>
              <Input
                className="h-12"
                placeholder="e.g. Received via Cash / Bank Transfer"
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
              />
              {fieldErrors.note ? (
                <FieldError>{fieldErrors.note}</FieldError>
              ) : null}
            </FieldStack>
          </FormStack>
        </DialogSection>

        <DialogActionRow>
          <DialogFormActions
            onCancel={() => onOpenChange(false)}
            cancelText="Dismiss"
            submitText="Post Payment"
            submittingText="Syncing..."
            submitting={processing}
            submitFormId="order-payment-form"
            submitSize="lg"
          />
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  );
}
