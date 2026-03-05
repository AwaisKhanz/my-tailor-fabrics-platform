"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  paymentDisbursementFormSchema,
  type Payment,
  type PaymentSummary,
} from "@tbms/shared-types";
import { employeesApi } from "@/lib/api/employees";
import { paymentsApi } from "@/lib/api/payments";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";
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
  const [disbursing, setDisbursing] = useState(false);

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
    setDisburseOpen(true);
  }, []);

  const closeDisburseDialog = useCallback((open: boolean) => {
    setDisburseOpen(open);
    if (!open && !disbursing) {
      setDisburseForm(DEFAULT_DISBURSEMENT_FORM);
    }
  }, [disbursing]);

  const setDisbursementAmount = useCallback((value: string) => {
    setDisburseForm((previous) => ({ ...previous, amount: value }));
  }, []);

  const setDisbursementNote = useCallback((value: string) => {
    setDisburseForm((previous) => ({ ...previous, note: value }));
  }, []);

  const currentBalance = summary?.currentBalance ?? 0;

  const submitDisbursement = useCallback(async () => {
    if (!selectedEmployeeId) {
      return;
    }

    const parsedResult = paymentDisbursementFormSchema.safeParse(disburseForm);
    if (!parsedResult.success) {
      toast({
        title: "Validation error",
        description: getFirstZodErrorMessage(parsedResult.error),
        variant: "destructive",
      });
      return;
    }

    const amountInPaisa = Math.round(parsedResult.data.amount * 100);

    if (amountInPaisa > currentBalance) {
      toast({
        title: "Amount exceeds outstanding balance",
        description: "Disbursement amount cannot be greater than the pending payable amount.",
        variant: "destructive",
      });
      return;
    }

    setDisbursing(true);
    try {
      await paymentsApi.disburse({
        employeeId: selectedEmployeeId,
        amount: amountInPaisa,
        note: parsedResult.data.note || undefined,
      });

      toast({ title: "Payment disbursed successfully" });
      setDisburseOpen(false);
      setDisburseForm(DEFAULT_DISBURSEMENT_FORM);

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
    disbursing,
    currentBalance,
    canDisburse: Boolean(selectedEmployeeId && currentBalance > 0),
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
  };
}
