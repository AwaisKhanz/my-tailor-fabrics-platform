"use client";

import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { EmployeeStatus, PaymentType, type Employee } from "@tbms/shared-types";
import { employeesApi } from "@/lib/api/employees";
import { useToast } from "@/hooks/use-toast";
import { typedZodResolver } from "@/lib/utils/form";
import { employeeSchema, type EmployeeFormValues } from "@/types/employees";

const DEFAULT_VALUES: EmployeeFormValues = {
  fullName: "",
  phone: "",
  phone2: "",
  address: "",
  city: "",
  designation: "",
  status: EmployeeStatus.ACTIVE,
  paymentType: PaymentType.PER_PIECE,
  dateOfJoining: new Date().toISOString().split("T")[0],
  dateOfBirth: "",
  emergencyName: "",
  emergencyPhone: "",
};

function toDateString(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface UseEmployeeDialogParams {
  open: boolean;
  initialData?: Employee | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function useEmployeeDialog({
  open,
  initialData,
  onOpenChange,
  onSuccess,
}: UseEmployeeDialogParams) {
  const { toast } = useToast();

  const form = useForm<EmployeeFormValues>({
    resolver: typedZodResolver<EmployeeFormValues>(employeeSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(
      initialData
        ? {
            fullName: initialData.fullName,
            phone: initialData.phone,
            phone2: initialData.phone2 ?? "",
            address: initialData.address ?? "",
            city: initialData.city ?? "",
            designation: initialData.designation ?? "",
            status: initialData.status,
            paymentType: initialData.paymentType,
            dateOfJoining: toDateString(initialData.dateOfJoining),
            dateOfBirth: toDateString(initialData.dateOfBirth),
            emergencyName: initialData.emergencyName ?? "",
            emergencyPhone: initialData.emergencyPhone ?? "",
          }
        : DEFAULT_VALUES,
    );
  }, [form, initialData, open]);

  const submitEmployee = useCallback(
    async (values: EmployeeFormValues) => {
      try {
        if (initialData) {
          const updatePayload = { ...values } as Partial<EmployeeFormValues> & Record<string, unknown>;
          if (!updatePayload.dateOfBirth) {
            delete updatePayload.dateOfBirth;
          }
          if (!updatePayload.dateOfJoining) {
            delete updatePayload.dateOfJoining;
          }
          delete updatePayload.branchId;

          await employeesApi.updateEmployee(initialData.id, updatePayload);
          toast({ title: "Employee updated successfully" });
        } else {
          const createPayload = { ...values } as Partial<EmployeeFormValues> & Record<string, unknown>;
          if (!createPayload.dateOfBirth) {
            delete createPayload.dateOfBirth;
          }
          if (!createPayload.dateOfJoining) {
            delete createPayload.dateOfJoining;
          }
          delete createPayload.status;
          delete createPayload.branchId;

          await employeesApi.createEmployee(createPayload);
          toast({ title: "Employee created successfully" });
        }

        onSuccess();
        onOpenChange(false);
      } catch {
        toast({
          title: "Error",
          description: "Failed to save employee profile. Please try again.",
          variant: "destructive",
        });
      }
    },
    [initialData, onOpenChange, onSuccess, toast],
  );

  return {
    form,
    submitForm: form.handleSubmit(submitEmployee),
  };
}
