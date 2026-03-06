"use client";

import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  CreateEmployeeInput,
  EmployeeStatus,
  PaymentType,
  UpdateEmployeeInput,
  type Employee,
} from "@tbms/shared-types";
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
  monthlySalary: undefined,
  dateOfJoining: new Date().toISOString().split("T")[0],
  employmentEndDate: "",
  dateOfBirth: "",
  emergencyName: "",
  emergencyPhone: "",
};

function toEmployeeInput(values: EmployeeFormValues): CreateEmployeeInput {
  const payload: CreateEmployeeInput = {
    fullName: values.fullName,
    phone: values.phone,
    phone2: values.phone2 || undefined,
    address: values.address || undefined,
    city: values.city || undefined,
    designation: values.designation || undefined,
    paymentType: values.paymentType,
    monthlySalary:
      values.paymentType === PaymentType.MONTHLY_FIXED
        ? values.monthlySalary
        : undefined,
    dateOfBirth: values.dateOfBirth || undefined,
    dateOfJoining: values.dateOfJoining || undefined,
    employmentEndDate: values.employmentEndDate || undefined,
    emergencyName: values.emergencyName || undefined,
    emergencyPhone: values.emergencyPhone || undefined,
  };

  return payload;
}

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
    resolver: typedZodResolver(employeeSchema),
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
            monthlySalary:
              initialData.monthlySalary != null
                ? initialData.monthlySalary / 100
                : undefined,
            dateOfJoining: toDateString(initialData.dateOfJoining),
            employmentEndDate: toDateString(initialData.employmentEndDate),
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
          const updatePayload: UpdateEmployeeInput = {
            ...toEmployeeInput(values),
            status: values.status,
          };
          await employeesApi.updateEmployee(initialData.id, updatePayload);
          toast({ title: "Employee updated successfully" });
        } else {
          const createPayload: CreateEmployeeInput = toEmployeeInput(values);
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
