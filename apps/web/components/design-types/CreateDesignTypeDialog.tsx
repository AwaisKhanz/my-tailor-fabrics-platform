"use client";

import { Banknote } from "lucide-react";
import {
  type DesignType,
} from "@tbms/shared-types";
import { Form } from "@tbms/ui/components/form";
import { DialogFormActions, FormStack } from "@tbms/ui/components/form-layout";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { Text } from "@tbms/ui/components/typography";
import { DesignTypeDialogBasicFields } from "@/components/design-types/dialog/design-type-dialog-basic-fields";
import { DesignTypeDialogScopeFields } from "@/components/design-types/dialog/design-type-dialog-scope-fields";
import { DesignTypeDialogSortField } from "@/components/design-types/dialog/design-type-dialog-sort-field";
import {
  type DesignTypeSubmitPayload,
  useDesignTypeDialog,
} from "@/hooks/use-design-type-dialog";

interface CreateDesignTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: DesignTypeSubmitPayload) => Promise<void>;
  initialData?: DesignType | null;
  garmentTypes: { id: string; name: string }[];
  branches: { id: string; name: string; code: string }[];
}

export function CreateDesignTypeDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  garmentTypes,
  branches,
}: CreateDesignTypeDialogProps) {
  const {
    form,
    submitting,
    garmentScopeOptions,
    branchScopeOptions,
    submitForm,
  } = useDesignTypeDialog({
    open,
    initialData,
    onOpenChange,
    onSubmit,
    garmentTypes,
    branches,
  });

  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitFormId="design-type-form"
      submitting={submitting}
      submitText={initialData ? "Update Design" : "Create Design"}
      cancelVariant="outline"
      submitClassName="font-bold"
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Design Type" : "Define Design Type"}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-md"
    >
      <div className="-mt-1 mb-4 flex items-start gap-2">
        <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <Text as="p"  variant="lead">
          Set standardized customer pricing and employee labor rates for a specific design.
        </Text>
      </div>

      <Form {...form}>
        <FormStack as="form" id="design-type-form" onSubmit={submitForm} className="py-1">
          <DesignTypeDialogBasicFields form={form} />
          <DesignTypeDialogScopeFields
            form={form}
            garmentScopeOptions={garmentScopeOptions}
            branchScopeOptions={branchScopeOptions}
          />
          <DesignTypeDialogSortField form={form} />
        </FormStack>
      </Form>
    </ScrollableDialog>
  );
}
