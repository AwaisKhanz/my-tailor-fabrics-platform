"use client";

import { Banknote, CalendarClock } from "lucide-react";
import { PaymentsDisburseDialog } from "@/components/payments/payments-disburse-dialog";
import { PaymentsEmployeeSelectorCard } from "@/components/payments/payments-employee-selector-card";
import { PaymentsGenerateSalariesDialog } from "@/components/payments/payments-generate-salaries-dialog";
import { PaymentsHistorySection } from "@/components/payments/payments-history-section";
import { PaymentsSummaryCards } from "@/components/payments/payments-summary-cards";
import { ActionStrip } from "@tbms/ui/components/action-strip";
import { Button } from "@tbms/ui/components/button";
import { ConfirmDialog } from "@tbms/ui/components/confirm-dialog";
import { EmptyState } from "@tbms/ui/components/empty-state";
import { PageHeader } from "@tbms/ui/components/page-header";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { useAuthz } from "@/hooks/use-authz";
import { usePaymentsPage } from "@/hooks/use-payments-page";
import { PERMISSION } from "@tbms/shared-constants";

export function PaymentsPage() {
  const { canAll } = useAuthz();
  const canManagePayments = canAll([PERMISSION["payments.manage"]]);
  const {
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
    canDisburse,
    hasSelectedEmployee,
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
  } = usePaymentsPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Employee Payments"
          description={
            selectedEmployee
              ? `Manage payouts and settlement history for ${selectedEmployee.fullName}.`
              : "Select an employee to review outstanding balances and disbursement history."
          }
          actions={
            canManagePayments ? (
              <ActionStrip stack>
                <Button variant="outline" onClick={openGenerateSalariesDialog}>
                  <CalendarClock className="h-4 w-4" />
                  Generate Monthly Salaries
                </Button>
                {canDisburse ? (
                  <Button variant="default" onClick={openDisburseDialog}>
                    <Banknote className="h-4 w-4" />
                    Disburse Payment
                  </Button>
                ) : null}
              </ActionStrip>
            ) : null
          }
          surface="card"
          density="compact"
        />
      </PageSection>

      <PageSection spacing="compact">
        <PaymentsEmployeeSelectorCard
          employees={employees}
          loading={employeesLoading}
          selectedEmployeeId={selectedEmployeeId}
          selectedEmployee={selectedEmployee}
          onEmployeeChange={handleEmployeeChange}
        />
      </PageSection>

      <PageSection spacing="compact">
        {hasSelectedEmployee ? (
          <>
            <PaymentsSummaryCards
              loading={summaryLoading}
              summary={summary}
              currentBalance={currentBalance}
              canDisburse={canManagePayments && canDisburse}
              canManagePayments={canManagePayments}
              onDisburse={openDisburseDialog}
            />

            <PaymentsHistorySection
              history={history}
              loading={historyLoading}
              page={historyPage}
              total={historyTotal}
              limit={historyPageSize}
              filters={historyFilters}
              activeFilterCount={historyFilterCount}
              canManagePayments={canManagePayments}
              reversingPaymentId={reversingPaymentId}
              onPageChange={setHistoryPage}
              onFromChange={setHistoryFrom}
              onToChange={setHistoryTo}
              onResetFilters={resetHistoryFilters}
              onReversePayment={requestReversePayment}
            />
          </>
        ) : (
          <EmptyState
            icon={Banknote}
            title="No Employee Selected"
            description="Choose an employee above to view their outstanding balance and payment ledger."
          />
        )}
      </PageSection>

      {canManagePayments ? (
        <PaymentsDisburseDialog
          open={disburseOpen}
          loading={disbursing}
          employeeName={selectedEmployee?.fullName ?? "selected employee"}
          currentBalance={currentBalance}
          form={disburseForm}
          validationError={disburseValidationError}
          onOpenChange={closeDisburseDialog}
          onAmountChange={setDisbursementAmount}
          onNoteChange={setDisbursementNote}
          onSubmit={submitDisbursement}
        />
      ) : null}

      {canManagePayments ? (
        <PaymentsGenerateSalariesDialog
          open={generateSalariesOpen}
          loading={generatingSalaries}
          form={salaryAccrualForm}
          validationError={salaryAccrualValidationError}
          selectedEmployeeName={selectedEmployee?.fullName ?? null}
          hasSelectedEmployee={hasSelectedEmployee}
          onOpenChange={closeGenerateSalariesDialog}
          onMonthChange={setSalaryAccrualMonth}
          onScopeChange={setSalaryAccrualScope}
          onSubmit={submitSalaryAccrualGeneration}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(paymentToReverseId)}
        onOpenChange={closeReversePaymentDialog}
        title="Reverse this payment?"
        description="This will create a reversal audit entry and restore the employee balance."
        onConfirm={confirmReversePayment}
        confirmText="Reverse Payment"
        variant="destructive"
        loading={Boolean(
          paymentToReverseId && reversingPaymentId === paymentToReverseId,
        )}
      />
    </PageShell>
  );
}
