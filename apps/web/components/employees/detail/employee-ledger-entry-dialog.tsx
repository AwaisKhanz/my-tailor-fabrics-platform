import { Banknote } from "lucide-react";
import { LedgerEntryType } from "@tbms/shared-types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeLedgerEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  entryType: LedgerEntryType;
  amount: string;
  note: string;
  submitting: boolean;
  onEntryTypeChange: (value: LedgerEntryType) => void;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
}

export function EmployeeLedgerEntryDialog({
  open,
  onOpenChange,
  employeeName,
  entryType,
  amount,
  note,
  submitting,
  onEntryTypeChange,
  onAmountChange,
  onNoteChange,
  onSubmit,
}: EmployeeLedgerEntryDialogProps) {
  const reducesBalance = [LedgerEntryType.ADVANCE, LedgerEntryType.DEDUCTION].includes(
    entryType,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Record Ledger Entry
          </DialogTitle>
          <DialogDescription>
            Manually record a transaction for <strong>{employeeName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Entry Type</Label>
            <Select value={entryType} onValueChange={(value) => onEntryTypeChange(value as LedgerEntryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LedgerEntryType.ADVANCE}>Advance Payment</SelectItem>
                <SelectItem value={LedgerEntryType.DEDUCTION}>Deduction</SelectItem>
                <SelectItem value={LedgerEntryType.ADJUSTMENT}>General Adjustment</SelectItem>
                <SelectItem value={LedgerEntryType.SALARY}>Monthly Salary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
              {reducesBalance
                ? "This entry will decrease employee balance"
                : "This entry will increase employee balance"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Amount (PKR)</Label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Note / Description</Label>
            <Input
              placeholder="e.g. Advance for medical bill"
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="premium" onClick={onSubmit} disabled={submitting || !amount}>
            {submitting ? "Recording..." : "Confirm & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
