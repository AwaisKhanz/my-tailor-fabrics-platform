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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/typography";
import {
  salaryAccrualGenerationFormSchema,
  type SalaryAccrualGenerationFormInput,
} from "@tbms/shared-types";
import { type SalaryAccrualForm } from "@/hooks/use-payments-page";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Generate Monthly Salaries</DialogTitle>
          <DialogDescription>
            Create ledger salary accrual entries for a payroll month.
          </DialogDescription>
        </DialogHeader>

        <DialogSection>
          <FormStack
            as="form"
            id="payments-generate-salaries-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase  text-muted-foreground">
                Payroll Month
              </Label>
              <Input
                type="month"
                value={form.month}
                onChange={(event) => onMonthChange(event.target.value)}
              />
              {validationError ? (
                <Text as="p" variant="muted" className="text-destructive">
                  {validationError}
                </Text>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase  text-muted-foreground">
                Scope
              </Label>
              <Select
                value={form.scope}
                onValueChange={(value) => {
                  if (isSalaryAccrualScope(value)) {
                    onScopeChange(value);
                  }
                }}
                disabled={!hasSelectedEmployee}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    All monthly employees in branch
                  </SelectItem>
                  {hasSelectedEmployee ? (
                    <SelectItem value="SELECTED">
                      Only selected employee
                      {selectedEmployeeName ? ` (${selectedEmployeeName})` : ""}
                    </SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
              <Text as="p" variant="muted" className="text-xs">
                System is idempotent and skips already generated employee-month
                accruals.
              </Text>
            </div>
          </FormStack>
        </DialogSection>

        <DialogActionRow>
          <DialogFormActions
            onCancel={() => onOpenChange(false)}
            submitText="Generate"
            submittingText="Generating..."
            submitting={loading}
            submitDisabled={!isValid}
            submitFormId="payments-generate-salaries-form"
            submitSize="lg"
          />
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  );
}
