"use client";

import type {
  ExpenseCategory,
  ExpenseCategoryFormValues,
} from "@tbms/shared-types";
import { FieldError, FieldLabel, FieldStack } from "@tbms/ui/components/field";
import { DialogFormActions, FormStack } from "@tbms/ui/components/form-layout";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { Input } from "@tbms/ui/components/input";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { Switch } from "@tbms/ui/components/switch";
import { Text } from "@tbms/ui/components/typography";

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
      title={editingCategory ? "Edit Expense Category" : "Create Expense Category"}
      description="Configure reusable categories for branch expense logging."
      footerActions={
        <DialogFormActions
          onCancel={() => onOpenChange(false)}
          submitText={editingCategory ? "Save Changes" : "Create Category"}
          submittingText="Saving..."
          submitting={saving}
          submitFormId="expense-category-form"
        />
      }
    >
      <FormStack
        as="form"
          id="expense-category-form"
          density="default"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit();
          }}
        >
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
          {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
        </FieldStack>

        <InfoTile tone="secondary" layout="betweenGap" padding="contentLg" radius="xl">
          <div>
            <Text as="p" variant="body" className="font-medium">
              Active
            </Text>
            <Text as="p" variant="muted" className="text-xs">
              Active categories are available in expense entry forms.
            </Text>
          </div>
          <Switch
            checked={form.isActive}
            onCheckedChange={(checked) => onUpdateField("isActive", checked)}
            disabled={saving}
          />
        </InfoTile>
      </FormStack>
    </ScrollableDialog>
  );
}
