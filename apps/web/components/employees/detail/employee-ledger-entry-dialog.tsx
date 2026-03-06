import { Banknote } from "lucide-react";
import { LedgerEntryType } from "@tbms/shared-types";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  fieldErrors: {
    type?: string;
    amount?: string;
    note?: string;
  };
  validationError: string;
  onEntryTypeChange: (value: LedgerEntryType) => void;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
}

function isLedgerEntryType(value: string): value is LedgerEntryType {
  const types = Object.values(LedgerEntryType);
  return types.some((type) => type === value);
}

export function EmployeeLedgerEntryDialog({
  open,
  onOpenChange,
  employeeName,
  entryType,
  amount,
  note,
  submitting,
  fieldErrors,
  validationError,
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
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Record Ledger Entry
          </DialogTitle>
          <DialogDescription>
            Manually record a transaction for <strong>{employeeName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <DialogSection>
          <FormStack
            as="form"
            id="employee-ledger-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            {validationError ? (
              <p className="text-sm text-destructive">{validationError}</p>
            ) : null}
            <div className="space-y-2">
              <Label>Entry Type</Label>
              <Select
                value={entryType}
                onValueChange={(value) => {
                  if (isLedgerEntryType(value)) {
                    onEntryTypeChange(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LedgerEntryType.ADVANCE}>Advance Payment</SelectItem>
                  <SelectItem value={LedgerEntryType.DEDUCTION}>Deduction</SelectItem>
                  <SelectItem value={LedgerEntryType.ADJUSTMENT}>General Adjustment</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.type ? (
                <p className="text-xs text-destructive">{fieldErrors.type}</p>
              ) : null}
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
              {fieldErrors.amount ? (
                <p className="text-xs text-destructive">{fieldErrors.amount}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Note / Description</Label>
              <Textarea
               
                className="min-h-[90px] resize-y"
                placeholder="e.g. Advance for medical bill"
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
              />
              {fieldErrors.note ? (
                <p className="text-xs text-destructive">{fieldErrors.note}</p>
              ) : null}
            </div>
          </FormStack>
        </DialogSection>

        <DialogActionRow>
          <DialogFormActions
            onCancel={() => onOpenChange(false)}
            submitText="Confirm & Save"
            submittingText="Recording..."
            submitting={submitting}
            submitFormId="employee-ledger-form"
            submitVariant="default"
          />
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  );
}
