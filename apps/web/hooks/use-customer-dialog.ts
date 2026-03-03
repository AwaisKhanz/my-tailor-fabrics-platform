"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { CustomerStatus, Role, type Customer } from "@tbms/shared-types";
import { customerApi } from "@/lib/api/customers";
import { useToast } from "@/hooks/use-toast";
import { useBranchStore } from "@/store/useBranchStore";
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

  const { data: session } = useSession();
  const user = session?.user;
  const { activeBranchId } = useBranchStore();

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
          await customerApi.updateCustomer(customer.id, values);
          toast({ title: "Customer updated successfully" });
        } else {
          // Backend create path does not accept status on create.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { status, ...createPayload } = values;

          if (user?.role === Role.SUPER_ADMIN && activeBranchId) {
            (createPayload as Record<string, unknown>).branchId = activeBranchId;
          }

          await customerApi.createCustomer(createPayload);
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
    [activeBranchId, customer, onOpenChange, onSuccess, toast, user?.role],
  );

  return {
    form,
    submitting,
    submitForm: form.handleSubmit(submitCustomer),
  };
}
