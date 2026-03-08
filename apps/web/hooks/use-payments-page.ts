"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  paymentDisbursementFormSchema,
  salaryAccrualGenerationFormSchema,
  type Payment,
  type PaymentSummary,
} from "@tbms/shared-types";
import { employeesApi } from "@/lib/api/employees";
import { paymentsApi } from "@/lib/api/payments";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { toPaisaFromRupees } from "@/lib/utils/money";
import { type Employee } from "@/types/employees";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;

export interface PaymentHistoryFilters {
  from: string;
  to: string;
}

export interface PaymentDisbursementForm {
  amount: string;
  note: string;
}

const DEFAULT_HISTORY_FILTERS: PaymentHistoryFilters = {
  from: "",
  to: "",
};

const DEFAULT_DISBURSEMENT_FORM: PaymentDisbursementForm = {
  amount: "",
  note: "",
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

  const [disburseOpen, setDisburseOpen] = useState(false);
  const [disburseForm, setDisburseForm] =
    useState<PaymentDisbursementForm>(DEFAULT_DISBURSEMENT_FORM);
  const [disburseValidationError, setDisburseValidationError] = useState<string | null>(null);
  const [disbursing, setDisbursing] = useState(false);
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
    setDisburseOpen(false);
    setDisburseForm(DEFAULT_DISBURSEMENT_FORM);
    setGenerateSalariesOpen(false);
    setSalaryAccrualForm({
      month: getPreviousPayrollMonth(),
      scope: employeeId ? "SELECTED" : "ALL",
    });
  }, [setValues]);

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

  const openDisburseDialog = useCallback(() => {
    setDisburseValidationError(null);
    setDisburseOpen(true);
  }, []);

  const closeDisburseDialog = useCallback((open: boolean) => {
    setDisburseOpen(open);
    if (!open && !disbursing) {
      setDisburseForm(DEFAULT_DISBURSEMENT_FORM);
      setDisburseValidationError(null);
    }
  }, [disbursing]);

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

  const setDisbursementAmount = useCallback((value: string) => {
    setDisburseForm((previous) => ({ ...previous, amount: value }));
    setDisburseValidationError(null);
  }, []);

  const setDisbursementNote = useCallback((value: string) => {
    setDisburseForm((previous) => ({ ...previous, note: value }));
    setDisburseValidationError(null);
  }, []);

  const currentBalance = summary?.currentBalance ?? 0;

  const submitDisbursement = useCallback(async () => {
    if (!selectedEmployeeId) {
      return;
    }

    const parsedResult = paymentDisbursementFormSchema.safeParse({
      amount: disburseForm.amount,
      note: disburseForm.note,
    });
    if (!parsedResult.success) {
      const firstIssue = parsedResult.error.issues[0]?.message;
      setDisburseValidationError(firstIssue ?? "Please complete required fields.");
      return;
    }
    setDisburseValidationError(null);

    const amountInPaisa = toPaisaFromRupees(parsedResult.data.amount);

    if (amountInPaisa > currentBalance) {
      setDisburseValidationError(
        "Disbursement amount cannot be greater than the outstanding payable balance.",
      );
      return;
    }

    setDisbursing(true);
    try {
      await paymentsApi.disburse({
        employeeId: selectedEmployeeId,
        amount: parsedResult.data.amount,
        note: parsedResult.data.note || undefined,
      });

      toast({ title: "Payment disbursed successfully" });
      setDisburseOpen(false);
      setDisburseForm(DEFAULT_DISBURSEMENT_FORM);
      setDisburseValidationError(null);

      await fetchSummary(selectedEmployeeId);
      if (historyPage !== 1) {
        setValues({ page: "1" });
      } else {
        await fetchHistory(1);
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(error, "Failed to disburse payment"),
        variant: "destructive",
      });
    } finally {
      setDisbursing(false);
    }
  }, [
    currentBalance,
    disburseForm.amount,
    disburseForm.note,
    fetchHistory,
    fetchSummary,
    historyPage,
    setValues,
    selectedEmployeeId,
    toast,
  ]);

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
