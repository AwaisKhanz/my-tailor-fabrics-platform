"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CustomerStatus,
  CreateCustomerInput,
  UpdateCustomerInput,
  type Customer,
} from "@tbms/shared-types";
import { customerApi } from "@/lib/api/customers";
import { useToast } from "@/hooks/use-toast";
import { typedZodResolver } from "@/lib/utils/form";
import { customerSchema, type CustomerFormValues } from "@/types/customers";

const DEFAULT_VALUES: CustomerFormValues = {
  fullName: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  status: CustomerStatus.ACTIVE,
  notes: "",
};

interface UseCustomerDialogParams {
  open: boolean;
  customer?: Customer | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function useCustomerDialog({
  open,
  customer,
  onOpenChange,
  onSuccess,
}: UseCustomerDialogParams) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: typedZodResolver<CustomerFormValues>(customerSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(
      customer
        ? {
            fullName: customer.fullName,
            phone: customer.phone,
            whatsapp: customer.whatsapp ?? "",
            email: customer.email ?? "",
            address: customer.address ?? "",
            city: customer.city ?? "",
            status: customer.status,
            notes: customer.notes ?? "",
          }
        : DEFAULT_VALUES,
    );
  }, [customer, form, open]);

  const submitCustomer = useCallback(
    async (values: CustomerFormValues) => {
      setSubmitting(true);
      try {
        if (customer) {
          const payload: UpdateCustomerInput = values;
          await customerApi.updateCustomer(customer.id, payload);
          toast({ title: "Customer updated successfully" });
        } else {
          // Backend create path does not accept status on create.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { status, ...createPayload } = values;
          const payload: CreateCustomerInput = createPayload;
          await customerApi.createCustomer(payload);
          toast({ title: "Customer created successfully" });
        }

        onSuccess();
        onOpenChange(false);
      } catch {
        toast({
          title: "Error",
          description: "Failed to save customer. Please try again.",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [customer, onOpenChange, onSuccess, toast],
  );

  return {
    form,
    submitting,
    submitForm: form.handleSubmit(submitCustomer),
  };
}
