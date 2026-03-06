import { type ExpenseCategory } from "@/lib/api/expenses";
import { ReceiptText } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ExpenseFormState } from "@/hooks/use-expenses-page";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Add Business Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for the current branch.
          </DialogDescription>
        </DialogHeader>

        <DialogSection>
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
              <Label variant="dashboard" className="mb-1 block">
                Entry Scope
              </Label>
              <Typography as="p" variant="body" className="inline-flex items-center gap-2 font-semibold">
                <ReceiptText className="h-4 w-4 text-primary" />
                Branch expense record
              </Typography>
            </InfoTile>

            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}

            <div className="space-y-2">
              <Label variant="dashboard">
                Category <span className="text-error">*</span>
              </Label>
              <Select
                value={form.categoryId}
                onValueChange={(value) => onFormChange("categoryId", value)}
                disabled={categoriesLoading}
              >
                <SelectTrigger variant="premium" className="h-11">
                  <SelectValue
                    placeholder={
                      categoriesLoading ? "Loading categories..." : "Select category"
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
                <p className="text-xs text-destructive">
                  {fieldErrors.categoryId}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label variant="dashboard">
                Amount (Rs.) <span className="text-error">*</span>
              </Label>
              <Input
                variant="premium"
                type="number"
                placeholder="e.g. 500"
                className="h-11"
                value={form.amount}
                onChange={(event) => onFormChange("amount", event.target.value)}
                min="1"
              />
              {fieldErrors.amount ? (
                <p className="text-xs text-destructive">{fieldErrors.amount}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label variant="dashboard">
                Expense Date <span className="text-error">*</span>
              </Label>
              <Input
                variant="premium"
                type="date"
                className="h-11"
                value={form.expenseDate}
                onChange={(event) => onFormChange("expenseDate", event.target.value)}
              />
              {fieldErrors.expenseDate ? (
                <p className="text-xs text-destructive">
                  {fieldErrors.expenseDate}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label variant="dashboard">Description</Label>
              <Textarea
                variant="premium"
                placeholder="What was this for?"
                className="min-h-[96px] resize-y"
                value={form.description}
                onChange={(event) => onFormChange("description", event.target.value)}
              />
              {fieldErrors.description ? (
                <p className="text-xs text-destructive">
                  {fieldErrors.description}
                </p>
              ) : null}
            </div>
          </FormStack>
        </DialogSection>

        <DialogActionRow>
          <DialogFormActions
            onCancel={() => onOpenChange(false)}
            submitText="Save Expense"
            submittingText="Saving…"
            submitting={saving}
            submitFormId="expense-create-form"
            submitSize="lg"
          />
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  );
}
