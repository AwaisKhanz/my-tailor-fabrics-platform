"use client";

import { useCallback, useEffect, useState } from "react";
import type { EmployeeWithRelations } from "@/lib/api/employees";
import {
  employeeCompensationChangeFormSchema,
  PaymentType,
  type CompensationChangeInput,
} from "@tbms/shared-types";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

function toDateInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export interface CompensationFieldErrors {
  paymentType?: string;
  monthlySalary?: string;
  effectiveFrom?: string;
  note?: string;
}

interface UseEmployeeCompensationManagerParams {
  employee: EmployeeWithRelations;
  onScheduleCompensationChange: (
    change: CompensationChangeInput,
  ) => Promise<boolean>;
}

export function useEmployeeCompensationManager({
  employee,
  onScheduleCompensationChange,
}: UseEmployeeCompensationManagerParams) {
  const [paymentType, setPaymentType] = useState<PaymentType>(
    employee.paymentType,
  );
  const [monthlySalary, setMonthlySalary] = useState<string>(
    employee.monthlySalary != null ? String(employee.monthlySalary / 100) : "",
  );
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    toDateInputValue(new Date().toISOString()),
  );
  const [note, setNote] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<CompensationFieldErrors>({});
  const [validationError, setValidationError] = useState<string>("");

  useEffect(() => {
    setPaymentType(employee.paymentType);
    setMonthlySalary(
      employee.monthlySalary != null ? String(employee.monthlySalary / 100) : "",
    );
  }, [employee.monthlySalary, employee.paymentType]);

  const clearFieldError = useCallback(
    (field: keyof CompensationFieldErrors) => {
      setFieldErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    },
    [],
  );

  const clearValidationError = useCallback(() => {
    setValidationError("");
  }, []);

  const submitCompensationChange = useCallback(() => {
    const payload: CompensationChangeInput = {
      paymentType,
      monthlySalary:
        paymentType === PaymentType.MONTHLY_FIXED && monthlySalary.length > 0
          ? Number(monthlySalary)
          : undefined,
      effectiveFrom,
      note: note || undefined,
    };

    const parsedResult =
      employeeCompensationChangeFormSchema.safeParse(payload);
    if (!parsedResult.success) {
      const flattenedErrors = parsedResult.error.flatten().fieldErrors;
      setFieldErrors({
        paymentType: flattenedErrors.paymentType?.[0],
        monthlySalary: flattenedErrors.monthlySalary?.[0],
        effectiveFrom: flattenedErrors.effectiveFrom?.[0],
        note: flattenedErrors.note?.[0],
      });
      setValidationError(getFirstZodErrorMessage(parsedResult.error));
      return;
    }

    setFieldErrors({});
    setValidationError("");
    void onScheduleCompensationChange(parsedResult.data);
  }, [
    effectiveFrom,
    monthlySalary,
    note,
    onScheduleCompensationChange,
    paymentType,
  ]);

  return {
    paymentType,
    monthlySalary,
    effectiveFrom,
    note,
    fieldErrors,
    validationError,
    setPaymentType,
    setMonthlySalary,
    setEffectiveFrom,
    setNote,
    clearFieldError,
    clearValidationError,
    submitCompensationChange,
  };
}
