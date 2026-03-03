"use client";

import { Banknote } from "lucide-react";
import { type DesignType } from "@tbms/shared-types";
import { Form } from "@/components/ui/form";
import { DialogFormActions, FormStack } from "@/components/ui/form-layout";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { Typography } from "@/components/ui/typography";
import { DesignTypeDialogBasicFields } from "@/components/design-types/dialog/design-type-dialog-basic-fields";
import { DesignTypeDialogScopeFields } from "@/components/design-types/dialog/design-type-dialog-scope-fields";
import { DesignTypeDialogSortField } from "@/components/design-types/dialog/design-type-dialog-sort-field";
import { useDesignTypeDialog } from "@/hooks/use-design-type-dialog";

interface CreateDesignTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<DesignType>) => Promise<void>;
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
  const { form, submitting, submitForm } = useDesignTypeDialog({
    open,
    initialData,
    onOpenChange,
    onSubmit,
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
        <Typography as="p" variant="lead">
          Set standardized customer pricing and employee labor rates for a specific design.
        </Typography>
      </div>

      <Form {...form}>
        <FormStack as="form" id="design-type-form" onSubmit={submitForm} className="py-1">
          <DesignTypeDialogBasicFields form={form} />
          <DesignTypeDialogScopeFields form={form} garmentTypes={garmentTypes} branches={branches} />
          <DesignTypeDialogSortField form={form} />
        </FormStack>
      </Form>
    </ScrollableDialog>
  );
}
