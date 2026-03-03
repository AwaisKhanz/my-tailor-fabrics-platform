"use client";

import { Form } from "@/components/ui/form";
import { DialogFormActions, FormStack } from "@/components/ui/form-layout";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { EmployeeDialogContactFields } from "@/components/employees/dialog/employee-dialog-contact-fields";
import { EmployeeDialogPrimaryFields } from "@/components/employees/dialog/employee-dialog-primary-fields";
import { EmployeeDialogWorkFields } from "@/components/employees/dialog/employee-dialog-work-fields";
import { useEmployeeDialog } from "@/hooks/use-employee-dialog";
import type { Employee } from "@/types/employees";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Employee | null;
  onSuccess: () => void;
}

export function EmployeeDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: EmployeeDialogProps) {
  const { form, submitForm } = useEmployeeDialog({
    open,
    initialData,
    onOpenChange,
    onSuccess,
  });

  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitFormId="employee-form"
      submitText={initialData ? "Update Employee" : "Create Employee"}
      cancelVariant="outline"
      submitClassName="w-[140px]"
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Employee Profile" : "Add New Employee"}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-[600px]"
    >
      <Form {...form}>
        <FormStack as="form" id="employee-form" onSubmit={submitForm} className="px-1 pb-2">
          <EmployeeDialogPrimaryFields form={form} />
          <EmployeeDialogWorkFields form={form} />
          <EmployeeDialogContactFields form={form} />
        </FormStack>
      </Form>
    </ScrollableDialog>
  );
}
