import { Banknote } from "lucide-react";
import { isLedgerEntryType, LedgerEntryType } from "@tbms/shared-types";
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
import {
  FieldError,
  FieldHint,
  FieldLabel,
  FieldStack,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
  const reducesBalance = [
    LedgerEntryType.ADVANCE,
    LedgerEntryType.DEDUCTION,
  ].includes(entryType);

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
              <FieldError size="sm">{validationError}</FieldError>
            ) : null}
            <FieldStack>
              <FieldLabel>Entry Type</FieldLabel>
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
                  <SelectItem value={LedgerEntryType.ADVANCE}>
                    Advance Payment
                  </SelectItem>
                  <SelectItem value={LedgerEntryType.DEDUCTION}>
                    Deduction
                  </SelectItem>
                  <SelectItem value={LedgerEntryType.ADJUSTMENT}>
                    General Adjustment
                  </SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.type ? (
                <FieldError>{fieldErrors.type}</FieldError>
              ) : null}
              <FieldHint className="font-bold uppercase">
                {reducesBalance
                  ? "This entry will decrease employee balance"
                  : "This entry will increase employee balance"}
              </FieldHint>
            </FieldStack>

            <FieldStack>
              <FieldLabel>Amount (PKR)</FieldLabel>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
              />
              {fieldErrors.amount ? (
                <FieldError>{fieldErrors.amount}</FieldError>
              ) : null}
            </FieldStack>

            <FieldStack>
              <FieldLabel>Note / Description</FieldLabel>
              <Textarea
                className="min-h-[90px] resize-y"
                placeholder="e.g. Advance for medical bill"
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
