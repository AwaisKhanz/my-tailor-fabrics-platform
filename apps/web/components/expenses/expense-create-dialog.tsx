import { type ExpenseCategory } from "@/lib/api/expenses";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

        <div className="space-y-4 py-4">
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
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="premium"
            size="lg"
            onClick={onSubmit}
            disabled={saveDisabled}
          >
            {saving ? "Saving…" : "Save Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
