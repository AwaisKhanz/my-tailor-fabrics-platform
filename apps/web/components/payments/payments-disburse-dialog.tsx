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
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";
import { toPaisaFromRupees } from "@/lib/utils/money";
import { paymentDisbursementFormSchema } from "@tbms/shared-types";
import { type PaymentDisbursementForm } from "@/hooks/use-payments-page";

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
            <InfoTile tone="pending" padding="contentLg" radius="xl">
              <Label variant="dashboard" className="mb-1 block">
                Available to pay
              </Label>
              <Typography as="p" variant="statValue" className="text-warning">
                {formatPKR(currentBalance)}
              </Typography>
            </InfoTile>

            <div className="space-y-2">
              <Label variant="dashboard">
                Amount (Rs.) <span className="text-destructive">*</span>
              </Label>
              <Input
                variant="premium"
                type="number"
                placeholder="e.g. 5000"
                className="h-11 text-lg font-bold"
                value={form.amount}
                onChange={(event) => onAmountChange(event.target.value)}
                min="1"
              />
              {validationError ? (
                <Typography as="p" variant="muted" className="text-destructive">
                  {validationError}
                </Typography>
              ) : exceedsBalance ? (
                <Typography as="p" variant="muted" className="text-destructive">
                  Amount cannot be greater than outstanding balance.
                </Typography>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label variant="dashboard">Note / Remarks</Label>
              <Input
                variant="premium"
                className="h-11"
                placeholder="e.g. Weekly settlement, advance payment..."
                value={form.note}
                onChange={(event) => onNoteChange(event.target.value)}
              />
            </div>
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
