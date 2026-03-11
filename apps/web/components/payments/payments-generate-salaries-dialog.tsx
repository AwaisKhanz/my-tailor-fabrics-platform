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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import {
  salaryAccrualGenerationFormSchema,
  type SalaryAccrualGenerationFormInput,
} from "@tbms/shared-types";
import { type SalaryAccrualForm } from "@/hooks/use-salary-accrual-manager";

interface PaymentsGenerateSalariesDialogProps {
  open: boolean;
  loading: boolean;
  form: SalaryAccrualForm;
  validationError: string | null;
  selectedEmployeeName: string | null;
  hasSelectedEmployee: boolean;
  onOpenChange: (open: boolean) => void;
  onMonthChange: (value: string) => void;
  onScopeChange: (scope: SalaryAccrualForm["scope"]) => void;
  onSubmit: () => void;
}

function isSalaryAccrualScope(
  value: string,
): value is SalaryAccrualForm["scope"] {
  return value === "ALL" || value === "SELECTED";
}

export function PaymentsGenerateSalariesDialog({
  open,
  loading,
  form,
  validationError,
  selectedEmployeeName,
  hasSelectedEmployee,
  onOpenChange,
  onMonthChange,
  onScopeChange,
  onSubmit,
}: PaymentsGenerateSalariesDialogProps) {
  const validationInput: SalaryAccrualGenerationFormInput = {
    month: form.month,
  };

  const parsedResult =
    salaryAccrualGenerationFormSchema.safeParse(validationInput);
  const isValid = parsedResult.success;

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Generate Monthly Salaries"
      description="Create ledger salary accrual entries for a payroll month."
      footerActions={
        <DialogFormActions
          onCancel={() => onOpenChange(false)}
          submitText="Generate"
          submittingText="Generating..."
          submitting={loading}
          submitDisabled={!isValid}
          submitFormId="payments-generate-salaries-form"
          submitSize="lg"
        />
      }
    >
      <FormStack
        as="form"
        id="payments-generate-salaries-form"
        density="relaxed"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <FieldStack>
          <FieldLabel>Payroll Month</FieldLabel>
          <Input
            type="month"
            value={form.month}
            onChange={(event) => onMonthChange(event.target.value)}
          />
          {validationError ? (
            <FieldError size="sm">{validationError}</FieldError>
          ) : null}
        </FieldStack>

        <FieldStack>
          <FieldLabel>Scope</FieldLabel>
          <Select
            value={form.scope}
            onValueChange={(value) => {
              if (value && isSalaryAccrualScope(value)) {
                onScopeChange(value);
              }
            }}
            disabled={!hasSelectedEmployee}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All monthly employees in branch</SelectItem>
              {hasSelectedEmployee ? (
                <SelectItem value="SELECTED">
                  Only selected employee
                  {selectedEmployeeName ? ` (${selectedEmployeeName})` : ""}
                </SelectItem>
              ) : null}
            </SelectContent>
          </Select>
          <FieldHint>
            System is idempotent and skips already generated employee-month
            accruals.
          </FieldHint>
        </FieldStack>
      </FormStack>
    </ScrollableDialog>
  );
}
