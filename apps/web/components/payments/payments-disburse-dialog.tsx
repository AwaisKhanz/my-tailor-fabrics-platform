import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";
import { type PaymentDisbursementForm } from "@/hooks/use-payments-page";

interface PaymentsDisburseDialogProps {
  open: boolean;
  loading: boolean;
  employeeName: string;
  currentBalance: number;
  form: PaymentDisbursementForm;
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
  onOpenChange,
  onAmountChange,
  onNoteChange,
  onSubmit,
}: PaymentsDisburseDialogProps) {
  const amountValue = Number.parseFloat(form.amount);
  const isAmountMissing = !form.amount || Number.isNaN(amountValue) || amountValue <= 0;
  const exceedsBalance = !Number.isNaN(amountValue) && Math.round(amountValue * 100) > currentBalance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Disburse Payment</DialogTitle>
          <DialogDescription>
            Initiating payout for <strong>{employeeName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
            <Label variant="dashboard" className="mb-1 block">
              Available to pay
            </Label>
            <Typography as="p" variant="statValue" className="text-warning">
              {formatPKR(currentBalance)}
            </Typography>
          </div>

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
            {exceedsBalance ? (
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
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="premium"
            size="lg"
            onClick={onSubmit}
            disabled={loading || isAmountMissing || exceedsBalance}
          >
            {loading ? "Processing…" : "Confirm & Pay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
