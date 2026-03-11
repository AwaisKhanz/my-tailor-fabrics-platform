import { Banknote } from "lucide-react";
import { isLedgerEntryType, LedgerEntryType } from "@tbms/shared-types";
import {
  DialogFormActions,
  FormStack,
} from "@tbms/ui/components/form-layout";
import {
  FieldError,
  FieldHint,
  FieldLabel,
  FieldStack,
} from "@tbms/ui/components/field";
import { Input } from "@tbms/ui/components/input";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { Textarea } from "@tbms/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";

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
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Record Ledger Entry"
      description={`Manually record a transaction for ${employeeName}.`}
      footerActions={
        <DialogFormActions
          onCancel={() => onOpenChange(false)}
          submitText="Confirm & Save"
          submittingText="Recording..."
          submitting={submitting}
          submitFormId="employee-ledger-form"
          submitVariant="default"
        />
      }
    >
      <FormStack
        as="form"
        id="employee-ledger-form"
        density="default"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {validationError ? <FieldError size="sm">{validationError}</FieldError> : null}
        <FieldStack>
          <FieldLabel className="inline-flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            Entry Type
          </FieldLabel>
          <Select
            value={entryType}
            onValueChange={(value) => {
              if (value && isLedgerEntryType(value)) {
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
              <SelectItem value={LedgerEntryType.DEDUCTION}>Deduction</SelectItem>
              <SelectItem value={LedgerEntryType.ADJUSTMENT}>
                General Adjustment
              </SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.type ? <FieldError>{fieldErrors.type}</FieldError> : null}
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
          {fieldErrors.amount ? <FieldError>{fieldErrors.amount}</FieldError> : null}
        </FieldStack>

        <FieldStack>
          <FieldLabel>Note / Description</FieldLabel>
          <Textarea
            className="min-h-[90px] resize-y"
            placeholder="e.g. Advance for medical bill"
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
          />
          {fieldErrors.note ? <FieldError>{fieldErrors.note}</FieldError> : null}
        </FieldStack>
      </FormStack>
    </ScrollableDialog>
  );
}
