"use client";

import { Form } from "@/components/ui/form";
import { DialogFormActions, FormStack } from "@/components/ui/form-layout";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { MeasurementCategoryDialogNameField } from "@/components/config/measurements/dialog/measurement-category-dialog-name-field";
import { useMeasurementCategoryDialog } from "@/hooks/use-measurement-category-dialog";
import { type MeasurementCategory } from "@tbms/shared-types";

interface MeasurementCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: MeasurementCategory | null;
  onSuccess: () => void;
}

export function MeasurementCategoryDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: MeasurementCategoryDialogProps) {
  const { form, loading, submitForm } = useMeasurementCategoryDialog({
    open,
    initialData,
    onOpenChange,
    onSuccess,
  });

  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitFormId="category-form"
      submitText="Save Category"
      submitting={loading}
      cancelVariant="outline"
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Category" : "Add Measurement Category"}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-md"
    >
      <Form {...form}>
        <FormStack as="form" id="category-form" onSubmit={submitForm} density="relaxed" className="px-1 pb-2">
          <MeasurementCategoryDialogNameField form={form} />
        </FormStack>
      </Form>
    </ScrollableDialog>
  );
}
