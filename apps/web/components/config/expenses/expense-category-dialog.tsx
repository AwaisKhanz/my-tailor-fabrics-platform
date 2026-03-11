"use client";

import type {
  ExpenseCategory,
  ExpenseCategoryFormValues,
} from "@tbms/shared-types";
import { FieldError, FieldLabel, FieldStack } from "@/components/ui/field";
import { DialogFormActions, FormStack } from "@/components/ui/form-layout";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { Switch } from "@/components/ui/switch";

interface ExpenseCategoryDialogProps {
  open: boolean;
  editingCategory: ExpenseCategory | null;
  saving: boolean;
  form: ExpenseCategoryFormValues;
  formError: string;
  fieldErrors: Partial<Record<keyof ExpenseCategoryFormValues, string>>;
  onOpenChange: (open: boolean) => void;
  onUpdateField: <K extends keyof ExpenseCategoryFormValues>(
    field: K,
    value: ExpenseCategoryFormValues[K],
  ) => void;
  onSubmit: () => void | Promise<void>;
}

export function ExpenseCategoryDialog({
  open,
  editingCategory,
  saving,
  form,
  formError,
  fieldErrors,
  onOpenChange,
  onUpdateField,
  onSubmit,
}: ExpenseCategoryDialogProps) {
  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        editingCategory ? "Edit Expense Category" : "Create Expense Category"
      }
      footerActions={
        <DialogFormActions
          onCancel={() => onOpenChange(false)}
          submitFormId="expense-category-form"
          submitting={saving}
          submitText={editingCategory ? "Save Changes" : "Create Category"}
          submitVariant="default"
        />
      }
    >
      <FormStack
        as="form"
        id="expense-category-form"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
        <div className="space-y-4">
          {formError ? <FieldError size="sm">{formError}</FieldError> : null}

          <FieldStack>
            <FieldLabel htmlFor="expense-category-name">Name</FieldLabel>
            <Input
              id="expense-category-name"
              value={form.name}
              onChange={(event) => onUpdateField("name", event.target.value)}
              placeholder="e.g. Utilities"
              disabled={saving}
            />
            {fieldErrors.name ? (
              <FieldError>{fieldErrors.name}</FieldError>
            ) : null}
          </FieldStack>

          <InfoTile layout="betweenGap" className="rounded-md">
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">
                Active categories are available in expense entry forms.
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => onUpdateField("isActive", checked)}
              disabled={saving}
            />
          </InfoTile>
        </div>
      </FormStack>
    </ScrollableDialog>
  );
}
