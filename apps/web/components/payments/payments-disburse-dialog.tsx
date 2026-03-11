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
import { Heading, Text } from "@/components/ui/typography";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Disburse Payment</DialogTitle>
          <DialogDescription>
            Initiating payout for <strong>{employeeName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <DialogSection>
          <FormStack
            as="form"
            id="payments-disburse-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <InfoTile tone="secondary" padding="contentLg" radius="xl">
              <FieldLabel block className="mb-1">
                Available to pay
              </FieldLabel>
              <Heading
                as="div"
                variant="stat"
                className="text-secondary-foreground"
              >
                {formatPKR(currentBalance)}
              </Heading>
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
        </DialogSection>

        <DialogActionRow>
          <DialogFormActions
            onCancel={() => onOpenChange(false)}
            submitText="Confirm & Pay"
            submittingText="Processing…"
            submitting={loading}
            submitFormId="payments-disburse-form"
            submitSize="lg"
          />
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  );
}
