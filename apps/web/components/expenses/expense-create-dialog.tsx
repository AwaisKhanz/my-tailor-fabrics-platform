import { type ExpenseCategory } from "@/lib/api/expenses";
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
import { type ExpenseFormState } from "@/hooks/use-expenses-page";

interface ExpenseCreateDialogProps {
  open: boolean;
  saving: boolean;
  categoriesLoading: boolean;
  categories: ExpenseCategory[];
  form: ExpenseFormState;
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
  onOpenChange,
  onFormChange,
  onSubmit,
}: ExpenseCreateDialogProps) {
  const amountValue = Number.parseFloat(form.amount);
  const amountInvalid = Number.isNaN(amountValue) || amountValue <= 0;
  const saveDisabled =
    saving || categoriesLoading || !form.categoryId || !form.amount || amountInvalid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <div className="space-y-2">
              <Label variant="dashboard">
                Category <span className="text-destructive">*</span>
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
            </div>

            <div className="space-y-2">
              <Label variant="dashboard">
                Amount (Rs.) <span className="text-destructive">*</span>
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
            </div>

            <div className="space-y-2">
              <Label variant="dashboard">
                Expense Date <span className="text-destructive">*</span>
              </Label>
              <Input
                variant="premium"
                type="date"
                className="h-11"
                value={form.expenseDate}
                onChange={(event) => onFormChange("expenseDate", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label variant="dashboard">Description</Label>
              <Input
                variant="premium"
                placeholder="What was this for?"
                className="h-11"
                value={form.description}
                onChange={(event) => onFormChange("description", event.target.value)}
              />
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
            submitDisabled={saveDisabled}
            submitSize="lg"
          />
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  );
}
