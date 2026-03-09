"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  salaryAccrualGenerationFormSchema,
  type Payment,
  type PaymentSummary,
} from "@tbms/shared-types";
import { employeesApi } from "@/lib/api/employees";
import { paymentsApi } from "@/lib/api/payments";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { type Employee } from "@/types/employees";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { usePaymentDisbursementManager } from "@/hooks/use-payment-disbursement-manager";

const PAGE_SIZE = 10;

export interface PaymentHistoryFilters {
  from: string;
  to: string;
}

const DEFAULT_HISTORY_FILTERS: PaymentHistoryFilters = {
  from: "",
  to: "",
};

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

export function usePaymentsPage() {
  const { toast } = useToast();
  const { values, setValues, getPositiveInt } = useUrlTableState({
    defaults: {
      employeeId: "",
      page: "1",
      limit: String(PAGE_SIZE),
      from: DEFAULT_HISTORY_FILTERS.from,
      to: DEFAULT_HISTORY_FILTERS.to,
    },
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);

  const selectedEmployeeId = values.employeeId;

  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [history, setHistory] = useState<Payment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const historyPage = getPositiveInt("page", 1);
  const historyPageSize = getPositiveInt("limit", PAGE_SIZE);
  const [historyTotal, setHistoryTotal] = useState(0);
  const historyFilters = useMemo<PaymentHistoryFilters>(
    () => ({
      from: values.from,
      to: values.to,
    }),
    [values.from, values.to],
  );

  const [reversingPaymentId, setReversingPaymentId] = useState<string | null>(
    null,
  );
  const [paymentToReverseId, setPaymentToReverseId] = useState<string | null>(
    null,
  );
  const [generateSalariesOpen, setGenerateSalariesOpen] = useState(false);
  const [salaryAccrualForm, setSalaryAccrualForm] = useState<SalaryAccrualForm>({
    month: getPreviousPayrollMonth(),
    scope: "ALL",
  });
  const [salaryAccrualValidationError, setSalaryAccrualValidationError] =
    useState<string | null>(null);
  const [generatingSalaries, setGeneratingSalaries] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    try {
      const response = await employeesApi.getEmployees({ page: 1, limit: 100 });
      if (response.success) {
        setEmployees(response.data.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not load employees",
        variant: "destructive",
      });
    } finally {
      setEmployeesLoading(false);
    }
  }, [toast]);

  const fetchSummary = useCallback(
    async (employeeId: string) => {
      if (!employeeId) {
        return;
      }

      setSummaryLoading(true);
      try {
        const response = await paymentsApi.getEmployeeSummary(employeeId);
        setSummary(response.data);
      } catch {
        toast({
          title: "Error",
          description: "Could not load payment summary",
          variant: "destructive",
        });
      } finally {
        setSummaryLoading(false);
      }
    },
    [toast],
  );

  const fetchHistory = useCallback(
    async (targetPage = historyPage) => {
      if (!selectedEmployeeId) {
        return;
      }

      setHistoryLoading(true);
      try {
        const response = await paymentsApi.getPaymentHistory(selectedEmployeeId, {
          page: targetPage,
          limit: historyPageSize,
          from: historyFilters.from || undefined,
          to: historyFilters.to || undefined,
        });

        if (response.success) {
          setHistory(response.data.data);
          setHistoryTotal(response.data.total);
        }
      } catch {
        toast({
          title: "Error",
          description: "Could not load payment history",
          variant: "destructive",
        });
      } finally {
        setHistoryLoading(false);
      }
    },
    [historyFilters.from, historyFilters.to, historyPage, historyPageSize, selectedEmployeeId, toast],
  );

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (!selectedEmployeeId) {
      return;
    }

    void fetchSummary(selectedEmployeeId);
  }, [fetchSummary, selectedEmployeeId]);

  useEffect(() => {
    if (!selectedEmployeeId) {
      return;
    }

    void fetchHistory();
  }, [fetchHistory, selectedEmployeeId]);

  const currentBalance = summary?.currentBalance ?? 0;

  const refreshPayments = useCallback(async () => {
    if (!selectedEmployeeId) {
      return;
    }

    await fetchSummary(selectedEmployeeId);
    if (historyPage !== 1) {
      setValues({ page: "1" });
      return;
    }

    await fetchHistory(1);
  }, [fetchHistory, fetchSummary, historyPage, selectedEmployeeId, setValues]);

  const {
    disburseOpen,
    disburseForm,
    disburseValidationError,
    disbursing,
    openDisburseDialog,
    closeDisburseDialog,
    setDisbursementAmount,
    setDisbursementNote,
    submitDisbursement,
    resetDisbursement,
  } = usePaymentDisbursementManager({
    selectedEmployeeId,
    currentBalance,
    refreshPayments,
    toast,
  });

  const handleEmployeeChange = useCallback((employeeId: string) => {
    setValues({
      employeeId,
      page: "1",
      from: DEFAULT_HISTORY_FILTERS.from,
      to: DEFAULT_HISTORY_FILTERS.to,
    });
    setSummary(null);
    setHistory([]);
    setHistoryTotal(0);
    setGenerateSalariesOpen(false);
    setSalaryAccrualForm({
      month: getPreviousPayrollMonth(),
      scope: employeeId ? "SELECTED" : "ALL",
    });
    resetDisbursement();
  }, [resetDisbursement, setValues]);

  const setHistoryFrom = useCallback((value: string) => {
    setValues({
      from: value,
      page: "1",
    });
  }, [setValues]);

  const setHistoryTo = useCallback((value: string) => {
    setValues({
      to: value,
      page: "1",
    });
  }, [setValues]);

  const resetHistoryFilters = useCallback(() => {
    setValues({
      from: DEFAULT_HISTORY_FILTERS.from,
      to: DEFAULT_HISTORY_FILTERS.to,
      page: "1",
    });
  }, [setValues]);

  const setHistoryPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  const openGenerateSalariesDialog = useCallback(() => {
    setSalaryAccrualForm({
      month: getPreviousPayrollMonth(),
      scope: selectedEmployeeId ? "SELECTED" : "ALL",
    });
    setGenerateSalariesOpen(true);
    setSalaryAccrualValidationError(null);
  }, [selectedEmployeeId]);

  const closeGenerateSalariesDialog = useCallback((open: boolean) => {
    setGenerateSalariesOpen(open);
    if (!open && !generatingSalaries) {
      setSalaryAccrualForm({
        month: getPreviousPayrollMonth(),
        scope: selectedEmployeeId ? "SELECTED" : "ALL",
      });
      setSalaryAccrualValidationError(null);
    }
  }, [generatingSalaries, selectedEmployeeId]);

  const setSalaryAccrualMonth = useCallback((value: string) => {
    setSalaryAccrualForm((previous) => ({ ...previous, month: value }));
    setSalaryAccrualValidationError(null);
  }, []);

  const setSalaryAccrualScope = useCallback((scope: SalaryAccrualForm["scope"]) => {
    setSalaryAccrualForm((previous) => ({ ...previous, scope }));
    setSalaryAccrualValidationError(null);
  }, []);

  const submitSalaryAccrualGeneration = useCallback(async () => {
    const selectedScopeEmployeeId =
      salaryAccrualForm.scope === "SELECTED" ? selectedEmployeeId || undefined : undefined;

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

    setGeneratingSalaries(true);
    try {
      const response = await paymentsApi.generateSalaryAccruals({
        month: parsedResult.data.month,
        employeeId: parsedResult.data.employeeId || undefined,
      });

      if (response.success) {
        const summary = response.data;
        toast({
          title: "Monthly salaries generated",
          description: `Created ${summary.created}, existing ${summary.alreadyExists}, skipped ${summary.skipped} for ${summary.period}.`,
        });
        setGenerateSalariesOpen(false);
        setSalaryAccrualForm({
          month: getPreviousPayrollMonth(),
          scope: selectedEmployeeId ? "SELECTED" : "ALL",
        });
        setSalaryAccrualValidationError(null);

        if (selectedEmployeeId) {
          await fetchSummary(selectedEmployeeId);
          await fetchHistory(1);
          if (historyPage !== 1) {
            setValues({ page: "1" });
          }
        }
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(error, "Failed to generate monthly salaries"),
        variant: "destructive",
      });
    } finally {
      setGeneratingSalaries(false);
    }
  }, [
    fetchHistory,
    fetchSummary,
    historyPage,
    salaryAccrualForm.month,
    salaryAccrualForm.scope,
    selectedEmployeeId,
    setValues,
    toast,
  ]);

  const reversePayment = useCallback(
    async (paymentId: string) => {
      if (!selectedEmployeeId) {
        return false;
      }

      setReversingPaymentId(paymentId);
      try {
        await paymentsApi.reverse(paymentId);
        toast({ title: "Payment reversed successfully" });

        await fetchSummary(selectedEmployeeId);
        await fetchHistory(1);
        if (historyPage !== 1) {
          setValues({ page: "1" });
        }

        return true;
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            error,
            "Failed to reverse payment",
          ),
          variant: "destructive",
        });
        return false;
      } finally {
        setReversingPaymentId(null);
      }
    },
    [
      fetchHistory,
      fetchSummary,
      historyPage,
      selectedEmployeeId,
      setValues,
      toast,
    ],
  );

  const requestReversePayment = useCallback((paymentId: string) => {
    setPaymentToReverseId(paymentId);
  }, []);

  const closeReversePaymentDialog = useCallback((open: boolean) => {
    if (!open) {
      setPaymentToReverseId(null);
    }
  }, []);

  const confirmReversePayment = useCallback(async () => {
    if (!paymentToReverseId) {
      return;
    }

    const reversed = await reversePayment(paymentToReverseId);
    if (reversed) {
      setPaymentToReverseId(null);
    }
  }, [paymentToReverseId, reversePayment]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId],
  );

  const historyFilterCount = useMemo(() => {
    let count = 0;
    if (historyFilters.from) {
      count += 1;
    }
    if (historyFilters.to) {
      count += 1;
    }
    return count;
  }, [historyFilters.from, historyFilters.to]);

  return {
    employees,
    employeesLoading,
    selectedEmployee,
    selectedEmployeeId,
    summary,
    summaryLoading,
    history,
    historyLoading,
    historyPage,
    historyTotal,
    historyFilters,
    historyFilterCount,
    historyPageSize,
    disburseOpen,
    disburseForm,
    disburseValidationError,
    disbursing,
    reversingPaymentId,
    paymentToReverseId,
    generateSalariesOpen,
    salaryAccrualForm,
    salaryAccrualValidationError,
    generatingSalaries,
    currentBalance,
    canDisburse: Boolean(selectedEmployeeId && currentBalance > 0),
    hasSelectedEmployee: Boolean(selectedEmployeeId),
    setHistoryPage,
    handleEmployeeChange,
    setHistoryFrom,
    setHistoryTo,
    resetHistoryFilters,
    openDisburseDialog,
    closeDisburseDialog,
    setDisbursementAmount,
    setDisbursementNote,
    submitDisbursement,
    openGenerateSalariesDialog,
    closeGenerateSalariesDialog,
    setSalaryAccrualMonth,
    setSalaryAccrualScope,
    submitSalaryAccrualGeneration,
    requestReversePayment,
    closeReversePaymentDialog,
    confirmReversePayment,
  };
}
