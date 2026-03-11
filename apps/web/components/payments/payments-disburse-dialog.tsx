import {
  DialogFormActions,
  FormStack,
} from "@tbms/ui/components/form-layout";
import { FieldError, FieldLabel, FieldStack } from "@tbms/ui/components/field";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { Input } from "@tbms/ui/components/input";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { Text } from "@tbms/ui/components/typography";
import { type PaymentDisbursementForm } from "@/hooks/use-payment-disbursement-manager";
import { formatPKR } from "@/lib/utils";
import { toPaisaFromRupees } from "@/lib/utils/money";
import { paymentDisbursementFormSchema } from "@tbms/shared-types";

interface PaymentsDisburseDialogProps {
  open: boolean;
  loading: boolean;
  employeeName: string;
  currentBalance: number;
  form: PaymentDisbursementForm;
  validationError: string | null;
  onOpenChange: (open: boolean) => void;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
}

export function PaymentsDisburseDialog({
  open,
  loading,
  employeeName,
  currentBalance,
  form,
  validationError,
  onOpenChange,
  onAmountChange,
  onNoteChange,
  onSubmit,
}: PaymentsDisburseDialogProps) {
  const parsedResult = paymentDisbursementFormSchema.safeParse(form);
  const parsedAmount = parsedResult.success ? parsedResult.data.amount : 0;
  const exceedsBalance =
    parsedResult.success && toPaisaFromRupees(parsedAmount) > currentBalance;

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Disburse Payment"
      description={`Initiating payout for ${employeeName}.`}
      footerActions={
        <DialogFormActions
          onCancel={() => onOpenChange(false)}
          submitText="Confirm & Pay"
          submittingText="Processing…"
          submitting={loading}
          submitFormId="payments-disburse-form"
          submitSize="lg"
        />
      }
    >
      <FormStack
        as="form"
        id="payments-disburse-form"
        density="relaxed"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <InfoTile padding="contentLg" radius="xl">
          <FieldLabel block className="mb-1">
            Available to pay
          </FieldLabel>
          <Text variant="body" as="p" className="text-2xl font-semibold">
            {formatPKR(currentBalance)}
          </Text>
        </InfoTile>

        <FieldStack>
          <FieldLabel>
            Amount (Rs.) <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            type="number"
            placeholder="e.g. 5000"
            className="h-11 text-lg font-bold"
            value={form.amount}
            onChange={(event) => onAmountChange(event.target.value)}
            min="1"
          />
          {validationError ? (
            <FieldError size="sm">{validationError}</FieldError>
          ) : exceedsBalance ? (
            <FieldError size="sm">
              Amount cannot be greater than outstanding balance.
            </FieldError>
          ) : null}
        </FieldStack>

        <FieldStack>
          <FieldLabel>Note / Remarks</FieldLabel>
          <Input
            className="h-11"
            placeholder="e.g. Weekly settlement, advance payment..."
            value={form.note}
            onChange={(event) => onNoteChange(event.target.value)}
          />
        </FieldStack>
      </FormStack>
    </ScrollableDialog>
  );
}
