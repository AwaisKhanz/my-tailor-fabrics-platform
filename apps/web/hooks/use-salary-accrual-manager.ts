"use client";

import { useCallback, useState } from "react";
import type { useToast } from "@/hooks/use-toast";
import { useGenerateSalaryAccruals } from "@/hooks/queries/payment-queries";
import { salaryAccrualGenerationFormSchema } from "@tbms/shared-types";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";

export interface SalaryAccrualForm {
  month: string;
  scope: "ALL" | "SELECTED";
}

const PAYROLL_TIMEZONE = "Asia/Karachi";

function getPreviousPayrollMonth(referenceDate = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: PAYROLL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  });
  const parts = formatter.formatToParts(referenceDate);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return new Date().toISOString().slice(0, 7);
  }

  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  return `${previousYear}-${String(previousMonth).padStart(2, "0")}`;
}

function createDefaultSalaryAccrualForm(
  selectedEmployeeId?: string,
): SalaryAccrualForm {
  return {
    month: getPreviousPayrollMonth(),
    scope: selectedEmployeeId ? "SELECTED" : "ALL",
  };
}

type ToastFn = ReturnType<typeof useToast>["toast"];

interface UseSalaryAccrualManagerParams {
  selectedEmployeeId: string;
  refreshPayments: () => Promise<void>;
  toast: ToastFn;
}

export function useSalaryAccrualManager({
  selectedEmployeeId,
  refreshPayments,
  toast,
}: UseSalaryAccrualManagerParams) {
  const generateSalaryAccrualsMutation = useGenerateSalaryAccruals();
  const [generateSalariesOpen, setGenerateSalariesOpen] = useState(false);
  const [salaryAccrualForm, setSalaryAccrualForm] = useState<SalaryAccrualForm>(
    createDefaultSalaryAccrualForm(),
  );
  const [salaryAccrualValidationError, setSalaryAccrualValidationError] =
    useState<string | null>(null);
  const generatingSalaries = generateSalaryAccrualsMutation.isPending;

  const resetSalaryAccrualForm = useCallback((employeeId?: string) => {
    setGenerateSalariesOpen(false);
    setSalaryAccrualForm(createDefaultSalaryAccrualForm(employeeId));
    setSalaryAccrualValidationError(null);
  }, []);

  const openGenerateSalariesDialog = useCallback(() => {
    setSalaryAccrualForm(createDefaultSalaryAccrualForm(selectedEmployeeId));
    setGenerateSalariesOpen(true);
    setSalaryAccrualValidationError(null);
  }, [selectedEmployeeId]);

  const closeGenerateSalariesDialog = useCallback(
    (open: boolean) => {
      setGenerateSalariesOpen(open);
      if (!open && !generatingSalaries) {
        setSalaryAccrualForm(
          createDefaultSalaryAccrualForm(selectedEmployeeId),
        );
        setSalaryAccrualValidationError(null);
      }
    },
    [generatingSalaries, selectedEmployeeId],
  );

  const setSalaryAccrualMonth = useCallback((value: string) => {
    setSalaryAccrualForm((previous) => ({ ...previous, month: value }));
    setSalaryAccrualValidationError(null);
  }, []);

  const setSalaryAccrualScope = useCallback(
    (scope: SalaryAccrualForm["scope"]) => {
      setSalaryAccrualForm((previous) => ({ ...previous, scope }));
      setSalaryAccrualValidationError(null);
    },
    [],
  );

  const submitSalaryAccrualGeneration = useCallback(async () => {
    const selectedScopeEmployeeId =
      salaryAccrualForm.scope === "SELECTED"
        ? selectedEmployeeId || undefined
        : undefined;

    const parsedResult = salaryAccrualGenerationFormSchema.safeParse({
      month: salaryAccrualForm.month,
      employeeId: selectedScopeEmployeeId,
    });

    if (!parsedResult.success) {
      const firstIssue = parsedResult.error.issues[0]?.message;
      setSalaryAccrualValidationError(
        firstIssue ?? "Please provide a valid payroll month.",
      );
      return;
    }

    setSalaryAccrualValidationError(null);
    try {
      const response = await generateSalaryAccrualsMutation.mutateAsync({
        month: parsedResult.data.month,
        employeeId: parsedResult.data.employeeId || undefined,
      });

      if (response.success) {
        const summary = response.data;
        toast({
          title: "Monthly salaries generated",
          description: `Created ${summary.created}, existing ${summary.alreadyExists}, skipped ${summary.skipped} for ${summary.period}.`,
        });
        resetSalaryAccrualForm(selectedEmployeeId);

        if (selectedEmployeeId) {
          await refreshPayments();
        }
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(
          error,
          "Failed to generate monthly salaries",
        ),
        variant: "destructive",
      });
    }
  }, [
    generateSalaryAccrualsMutation,
    refreshPayments,
    resetSalaryAccrualForm,
    salaryAccrualForm.month,
    salaryAccrualForm.scope,
    selectedEmployeeId,
    toast,
  ]);

  return {
    generateSalariesOpen,
    salaryAccrualForm,
    salaryAccrualValidationError,
    generatingSalaries,
    openGenerateSalariesDialog,
    closeGenerateSalariesDialog,
    setSalaryAccrualMonth,
    setSalaryAccrualScope,
    submitSalaryAccrualGeneration,
    resetSalaryAccrualForm,
  };
}
