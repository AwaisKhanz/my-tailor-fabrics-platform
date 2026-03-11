"use client";

import { Form } from "@tbms/ui/components/form";
import { DialogFormActions, FormStack } from "@tbms/ui/components/form-layout";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { CustomerDialogAddressField } from "@/components/customers/dialog/customer-dialog-address-field";
import { CustomerDialogMetaFields } from "@/components/customers/dialog/customer-dialog-meta-fields";
import { CustomerDialogPrimaryFields } from "@/components/customers/dialog/customer-dialog-primary-fields";
import { useCustomerDialog } from "@/hooks/use-customer-dialog";
import { type Customer } from "@tbms/shared-types";

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSuccess: () => void;
}

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerDialogProps) {
  const { form, submitting, submitForm } = useCustomerDialog({
    open,
    customer,
    onOpenChange,
    onSuccess,
  });

  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitFormId="customer-form"
      submitting={submitting}
      submitText={customer ? "Update Profile" : "Create Profile"}
      cancelVariant="outline"
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={customer ? "Edit Customer" : "Add New Customer"}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-[500px]"
    >
      <Form {...form}>
        <FormStack as="form" id="customer-form" onSubmit={submitForm} className="px-1 pb-2">
          <CustomerDialogPrimaryFields form={form} />
          <CustomerDialogMetaFields form={form} />
          <CustomerDialogAddressField form={form} />
        </FormStack>
      </Form>
    </ScrollableDialog>
  );
}
