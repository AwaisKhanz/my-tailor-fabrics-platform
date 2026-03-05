"use client";

import { Form } from "@/components/ui/form";
import { DialogFormActions, FormStack } from "@/components/ui/form-layout";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { type MeasurementField, type MeasurementSection } from "@tbms/shared-types";
import { useMeasurementFieldDialog } from "@/hooks/use-measurement-field-dialog";
import { MeasurementFieldDialogCategoryNote } from "@/components/config/measurements/detail/measurement-field-dialog-category-note";
import { MeasurementFieldDialogBasicFields } from "@/components/config/measurements/detail/measurement-field-dialog-basic-fields";
import { MeasurementFieldDialogDropdownOptions } from "@/components/config/measurements/detail/measurement-field-dialog-dropdown-options";
import { MeasurementFieldDialogRequiredToggle } from "@/components/config/measurements/detail/measurement-field-dialog-required-toggle";

interface MeasurementFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName?: string;
  initialData?: MeasurementField | null;
  existingFields?: MeasurementField[];
  existingSections?: MeasurementSection[];
  onSuccess: () => void;
}

export function MeasurementFieldDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  initialData,
  existingFields = [],
  existingSections = [],
  onSuccess,
}: MeasurementFieldDialogProps) {
  const {
    form,
    loading,
    fieldType,
    dropdownOptions,
    newOption,
    setNewOption,
    addOption,
    removeOption,
    submitForm,
  } = useMeasurementFieldDialog({
    open,
    categoryId,
    initialData,
    existingFields,
    existingSections,
    onOpenChange,
    onSuccess,
  });

  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitFormId="measurement-field-form"
      submitText={initialData ? "Save Changes" : "Add Field"}
      submitting={loading}
      cancelVariant="outline"
      submittingText={initialData ? "Saving Changes..." : "Adding Field..."}
      submitClassName="min-w-[130px]"
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Measurement Field" : "Add Measurement Field"}
      footerActions={footerActions}
    >
      <MeasurementFieldDialogCategoryNote categoryName={categoryName} />

      <Form {...form}>
        <FormStack as="form" id="measurement-field-form" onSubmit={submitForm} density="relaxed">
          <MeasurementFieldDialogBasicFields
            form={form}
            existingSectionNames={existingSections.map((section) => section.name)}
          />

          <MeasurementFieldDialogDropdownOptions
            fieldType={fieldType}
            options={dropdownOptions}
            newOption={newOption}
            onNewOptionChange={setNewOption}
            onAddOption={addOption}
            onRemoveOption={removeOption}
          />

          <MeasurementFieldDialogRequiredToggle form={form} />
        </FormStack>
      </Form>
    </ScrollableDialog>
  );
}
