import { type ExpenseCategory } from "@tbms/shared-types";
import { ReceiptText } from "lucide-react";
import {
  DialogFormActions,
  FormStack,
} from "@tbms/ui/components/form-layout";
import { FieldError, FieldLabel, FieldStack } from "@tbms/ui/components/field";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { Input } from "@tbms/ui/components/input";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { Textarea } from "@tbms/ui/components/textarea";
import { Text } from "@tbms/ui/components/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { type ExpenseFormState } from "@/hooks/use-create-expense-manager";

interface ExpenseCreateDialogProps {
  open: boolean;
  saving: boolean;
  categoriesLoading: boolean;
  categories: ExpenseCategory[];
  form: ExpenseFormState;
  formError: string;
  fieldErrors: Partial<Record<keyof ExpenseFormState, string>>;
  onOpenChange: (open: boolean) => void;
  onFormChange: <K extends keyof ExpenseFormState>(
    field: K,
    value: ExpenseFormState[K],
  ) => void;
  onSubmit: () => void;
}

export function ExpenseCreateDialog({
  open,
  saving,
  categoriesLoading,
  categories,
  form,
  formError,
  fieldErrors,
  onOpenChange,
  onFormChange,
  onSubmit,
}: ExpenseCreateDialogProps) {
  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Business Expense"
      description="Record a new expense for the current branch."
      footerActions={
        <DialogFormActions
          onCancel={() => onOpenChange(false)}
          submitText="Save Expense"
          submittingText="Saving…"
          submitting={saving}
          submitFormId="expense-create-form"
          submitSize="lg"
        />
      }
    >
      <FormStack
        as="form"
        id="expense-create-form"
        density="relaxed"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <InfoTile padding="contentLg" radius="xl">
          <FieldLabel block className="mb-1">
            Entry Scope
          </FieldLabel>
          <Text
            as="p"
            variant="body"
            className="inline-flex items-center gap-2 font-semibold"
          >
            <ReceiptText className="h-4 w-4 text-primary" />
            Branch expense record
          </Text>
        </InfoTile>

        {formError ? <FieldError size="sm">{formError}</FieldError> : null}

        <FieldStack>
          <FieldLabel>
            Category <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            value={form.categoryId}
            onValueChange={(value) =>
              onFormChange("categoryId", value ?? "")
            }
            disabled={categoriesLoading}
          >
            <SelectTrigger className="h-11">
              <SelectValue
                placeholder={
                  categoriesLoading
                    ? "Loading categories..."
                    : "Select category"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.categoryId ? (
            <FieldError>{fieldErrors.categoryId}</FieldError>
          ) : null}
        </FieldStack>

        <FieldStack>
          <FieldLabel>
            Amount (Rs.) <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            type="number"
            placeholder="e.g. 500"
            className="h-11"
            value={form.amount}
            onChange={(event) => onFormChange("amount", event.target.value)}
            min="1"
          />
          {fieldErrors.amount ? (
            <FieldError>{fieldErrors.amount}</FieldError>
          ) : null}
        </FieldStack>

        <FieldStack>
          <FieldLabel>
            Expense Date <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            type="date"
            className="h-11"
            value={form.expenseDate}
            onChange={(event) =>
              onFormChange("expenseDate", event.target.value)
            }
          />
          {fieldErrors.expenseDate ? (
            <FieldError>{fieldErrors.expenseDate}</FieldError>
          ) : null}
        </FieldStack>

        <FieldStack>
          <FieldLabel>Description</FieldLabel>
          <Textarea
            placeholder="What was this for?"
            className="min-h-[96px] resize-y"
            value={form.description}
            onChange={(event) =>
              onFormChange("description", event.target.value)
            }
          />
          {fieldErrors.description ? (
            <FieldError>{fieldErrors.description}</FieldError>
          ) : null}
        </FieldStack>
      </FormStack>
    </ScrollableDialog>
  );
}
