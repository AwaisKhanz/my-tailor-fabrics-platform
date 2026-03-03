import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPKR } from "@/lib/utils";

interface OrderPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  balanceDue: number;
  amount: string;
  note: string;
  processing: boolean;
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
  onAmountChange,
  onNoteChange,
  onSubmit,
}: OrderPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Capture Receipt</DialogTitle>
          <DialogDescription>
            Input financial deposit for Order <strong>#{orderNumber}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted px-5 py-4">
            <span className="text-[10px] font-bold uppercase tracking-tight opacity-50">
              Pending amount
            </span>
            <span className="text-xl font-bold tabular-nums text-foreground">
              {formatPKR(balanceDue)}
            </span>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-tight">
              Deposit Amount (Rs.) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              variant="premium"
              className="h-12 text-lg font-bold"
              placeholder="e.g. 1000"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              max={balanceDue / 100}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-tight">
              Transaction Note
            </Label>
            <Input
              variant="premium"
              className="h-12"
              placeholder="e.g. Received via Cash / Bank Transfer"
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Dismiss
          </Button>
          <Button
            variant="premium"
            size="lg"
            onClick={onSubmit}
            disabled={processing || !amount}
          >
            {processing ? "Syncing..." : "Post Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
