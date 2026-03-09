"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Payment, type PaymentSummary } from "@tbms/shared-types";
import { employeesApi } from "@/lib/api/employees";
import { paymentsApi } from "@/lib/api/payments";
import { type Employee } from "@/types/employees";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import type { useToast } from "@/hooks/use-toast";

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
  const latestSelectedEmployeeIdRef = useRef(selectedEmployeeId);
  const summaryRequestVersionRef = useRef(0);
  const historyRequestVersionRef = useRef(0);

  useEffect(() => {
    latestSelectedEmployeeIdRef.current = selectedEmployeeId;
  }, [selectedEmployeeId]);

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

      const requestVersion = summaryRequestVersionRef.current + 1;
      summaryRequestVersionRef.current = requestVersion;
      setSummaryLoading(true);
      try {
        const response = await paymentsApi.getEmployeeSummary(employeeId);
        if (
          summaryRequestVersionRef.current !== requestVersion ||
          latestSelectedEmployeeIdRef.current !== employeeId
        ) {
          return;
        }
        setSummary(response.data);
      } catch {
        if (
          summaryRequestVersionRef.current !== requestVersion ||
          latestSelectedEmployeeIdRef.current !== employeeId
        ) {
          return;
        }
        toast({
          title: "Error",
          description: "Could not load payment summary",
          variant: "destructive",
        });
      } finally {
        if (
          summaryRequestVersionRef.current === requestVersion &&
          latestSelectedEmployeeIdRef.current === employeeId
        ) {
          setSummaryLoading(false);
        }
      }
    },
    [toast],
  );

  const fetchHistory = useCallback(
    async (targetPage = historyPage) => {
      if (!selectedEmployeeId) {
        return;
      }

      const requestVersion = historyRequestVersionRef.current + 1;
      historyRequestVersionRef.current = requestVersion;
      const requestEmployeeId = selectedEmployeeId;
      setHistoryLoading(true);
      try {
        const response = await paymentsApi.getPaymentHistory(requestEmployeeId, {
          page: targetPage,
          limit: historyPageSize,
          from: historyFilters.from || undefined,
          to: historyFilters.to || undefined,
        });

        if (
          historyRequestVersionRef.current !== requestVersion ||
          latestSelectedEmployeeIdRef.current !== requestEmployeeId
        ) {
          return;
        }

        if (response.success) {
          setHistory(response.data.data);
          setHistoryTotal(response.data.total);
        }
      } catch {
        if (
          historyRequestVersionRef.current !== requestVersion ||
          latestSelectedEmployeeIdRef.current !== requestEmployeeId
        ) {
          return;
        }
        toast({
          title: "Error",
          description: "Could not load payment history",
          variant: "destructive",
        });
      } finally {
        if (
          historyRequestVersionRef.current === requestVersion &&
          latestSelectedEmployeeIdRef.current === requestEmployeeId
        ) {
          setHistoryLoading(false);
        }
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
    setHistoryTotal,
    setHistory,
    setSummary,
    summary,
    summaryLoading,
    setValues,
  };
}
