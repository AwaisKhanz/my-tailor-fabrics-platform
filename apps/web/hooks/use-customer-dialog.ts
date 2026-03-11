"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CustomerStatus,
  CreateCustomerInput,
  UpdateCustomerInput,
  type Customer,
} from "@tbms/shared-types";
import {
  useCreateCustomer,
  useUpdateCustomer,
} from "@/hooks/queries/customer-queries";
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

function toCreateCustomerInput(
  values: CustomerFormValues,
): CreateCustomerInput {
  return {
    fullName: values.fullName,
    phone: values.phone,
    whatsapp: values.whatsapp,
    email: values.email,
    address: values.address,
    city: values.city,
    notes: values.notes,
  };
}

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
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const submitting =
    createCustomerMutation.isPending || updateCustomerMutation.isPending;

  const form = useForm<CustomerFormValues>({
    resolver: typedZodResolver(customerSchema),
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
      try {
        if (customer) {
          const payload: UpdateCustomerInput = values;
          await updateCustomerMutation.mutateAsync({
            id: customer.id,
            data: payload,
          });
          toast({ title: "Customer updated successfully" });
        } else {
          const payload = toCreateCustomerInput(values);
          await createCustomerMutation.mutateAsync(payload);
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
      }
    },
    [
      createCustomerMutation,
      customer,
      onOpenChange,
      onSuccess,
      toast,
      updateCustomerMutation,
    ],
  );

  return {
    form,
    submitting,
    submitForm: form.handleSubmit(submitCustomer),
  };
}
