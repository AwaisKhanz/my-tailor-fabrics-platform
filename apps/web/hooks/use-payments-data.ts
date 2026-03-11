"use client";

import { useCallback, useMemo } from "react";
import { type Employee } from "@/types/employees";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import type { useToast } from "@/hooks/use-toast";
import { useEmployeesDropdown } from "@/hooks/queries/employee-queries";
import {
  useEmployeePaymentSummary,
  usePaymentHistory,
} from "@/hooks/queries/payment-queries";

const PAGE_SIZE = 10;

export interface PaymentHistoryFilters {
  from: string;
  to: string;
}

type ToastFn = ReturnType<typeof useToast>["toast"];

export const DEFAULT_PAYMENT_HISTORY_FILTERS: PaymentHistoryFilters = {
  from: "",
  to: "",
};

export function usePaymentsData(toast: ToastFn) {
  const { values, setValues, getPositiveInt } = useUrlTableState({
    defaults: {
      employeeId: "",
      page: "1",
      limit: String(PAGE_SIZE),
      from: DEFAULT_PAYMENT_HISTORY_FILTERS.from,
      to: DEFAULT_PAYMENT_HISTORY_FILTERS.to,
    },
  });

  const selectedEmployeeId = values.employeeId;

  const historyPage = getPositiveInt("page", 1);
  const historyPageSize = getPositiveInt("limit", PAGE_SIZE);
  const historyFilters = useMemo<PaymentHistoryFilters>(
    () => ({
      from: values.from,
      to: values.to,
    }),
    [values.from, values.to],
  );
  const employeesQuery = useEmployeesDropdown();
  const summaryQuery = useEmployeePaymentSummary(selectedEmployeeId || null);
  const historyQuery = usePaymentHistory(selectedEmployeeId || null, {
    page: historyPage,
    limit: historyPageSize,
    from: historyFilters.from || undefined,
    to: historyFilters.to || undefined,
  });

  const employees: Employee[] = employeesQuery.data?.success
    ? employeesQuery.data.data.data
    : [];
  const employeesLoading = employeesQuery.isLoading;

  const summary = summaryQuery.data?.success ? summaryQuery.data.data : null;
  const summaryLoading = summaryQuery.isLoading;

  const history = historyQuery.data?.success ? historyQuery.data.data.data : [];
  const historyLoading = historyQuery.isLoading;
  const historyTotal = historyQuery.data?.success
    ? historyQuery.data.data.total
    : 0;

  const fetchSummary = useCallback(
    async (employeeId: string) => {
      if (!employeeId || employeeId !== selectedEmployeeId) {
        return;
      }
      await summaryQuery.refetch();
    },
    [selectedEmployeeId, summaryQuery],
  );

  const fetchHistory = useCallback(async () => {
    await historyQuery.refetch();
  }, [historyQuery]);

  const refreshPayments = useCallback(async () => {
    if (!selectedEmployeeId) {
      return;
    }

    await summaryQuery.refetch();
    if (historyPage !== 1) {
      setValues({ page: "1" });
      return;
    }

    await historyQuery.refetch();
  }, [historyPage, historyQuery, selectedEmployeeId, setValues, summaryQuery]);

  const setHistoryFrom = useCallback(
    (value: string) => {
      setValues({
        from: value,
        page: "1",
      });
    },
    [setValues],
  );

  const setHistoryTo = useCallback(
    (value: string) => {
      setValues({
        to: value,
        page: "1",
      });
    },
    [setValues],
  );

  const resetHistoryFilters = useCallback(() => {
    setValues({
      from: DEFAULT_PAYMENT_HISTORY_FILTERS.from,
      to: DEFAULT_PAYMENT_HISTORY_FILTERS.to,
      page: "1",
    });
  }, [setValues]);

  const setHistoryPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const selectedEmployee = useMemo(
    () =>
      employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
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

  const currentBalance = summary?.currentBalance ?? 0;

  return {
    currentBalance,
    employees,
    employeesLoading,
    fetchHistory,
    fetchSummary,
    history,
    historyFilterCount,
    historyFilters,
    historyLoading,
    historyPage,
    historyPageSize,
    historyTotal,
    refreshPayments,
    resetHistoryFilters,
    selectedEmployee,
    selectedEmployeeId,
    setHistoryFrom,
    setHistoryPage,
    setHistoryTo,
    summary,
    summaryLoading,
    setValues,
  };
}
