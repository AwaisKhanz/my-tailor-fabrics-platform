"use client";

import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePaymentDisbursementManager } from "@/hooks/use-payment-disbursement-manager";
import { usePaymentReversalManager } from "@/hooks/use-payment-reversal-manager";
import { useSalaryAccrualManager } from "@/hooks/use-salary-accrual-manager";
import {
  DEFAULT_PAYMENT_HISTORY_FILTERS,
  usePaymentsData,
} from "@/hooks/use-payments-data";

export function usePaymentsPage() {
  const { toast } = useToast();
  const {
    currentBalance,
    employees,
    employeesLoading,
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
    setHistory,
    setHistoryFrom,
    setHistoryPage,
    setHistoryTo,
    setHistoryTotal,
    setSummary,
    summary,
    summaryLoading,
    setValues,
  } = usePaymentsData(toast);

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

  const {
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
  } = useSalaryAccrualManager({
    selectedEmployeeId,
    refreshPayments,
    toast,
  });

  const {
    reversingPaymentId,
    paymentToReverseId,
    requestReversePayment,
    closeReversePaymentDialog,
    confirmReversePayment,
  } = usePaymentReversalManager({
    selectedEmployeeId,
    refreshPayments,
    toast,
  });

  const handleEmployeeChange = useCallback(
    (employeeId: string) => {
      setValues({
        employeeId,
        page: "1",
        from: DEFAULT_PAYMENT_HISTORY_FILTERS.from,
        to: DEFAULT_PAYMENT_HISTORY_FILTERS.to,
      });
      setSummary(null);
      setHistory([]);
      setHistoryTotal(0);
      resetDisbursement();
      resetSalaryAccrualForm(employeeId);
    },
    [
      resetDisbursement,
      resetSalaryAccrualForm,
      setHistory,
      setHistoryTotal,
      setSummary,
      setValues,
    ],
  );

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
