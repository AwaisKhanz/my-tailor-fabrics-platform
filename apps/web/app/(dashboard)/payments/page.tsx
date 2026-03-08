"use client";

import { useState } from "react";
import { Banknote, CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell, PageSection } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { PaymentsDisburseDialog } from "@/components/payments/payments-disburse-dialog";
import { PaymentsGenerateSalariesDialog } from "@/components/payments/payments-generate-salaries-dialog";
import { PaymentsEmployeeSelectorCard } from "@/components/payments/payments-employee-selector-card";
import { PaymentsHistorySection } from "@/components/payments/payments-history-section";
import { PaymentsSummaryCards } from "@/components/payments/payments-summary-cards";
import { usePaymentsPage } from "@/hooks/use-payments-page";
import { useAuthz } from "@/hooks/use-authz";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function PaymentsPage() {
  const { canAll } = useAuthz();
  const canManagePayments = canAll(["payments.manage"]);
  const [paymentToReverseId, setPaymentToReverseId] = useState<string | null>(
    null,
  );
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
    reversePayment,
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
          density="compact"
          actions={
            canManagePayments ? (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={openGenerateSalariesDialog}
                >
                  <CalendarClock className="h-4 w-4" />
                  Generate Monthly Salaries
                </Button>
                {canDisburse ? (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={openDisburseDialog}
                  >
                    <Banknote className="h-4 w-4" />
                    Disburse Payment
                  </Button>
                ) : null}
              </div>
            ) : null
          }
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
              onReversePayment={setPaymentToReverseId}
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
        onOpenChange={(open) => {
          if (!open) {
            setPaymentToReverseId(null);
          }
        }}
        title="Reverse this payment?"
        description="This will create a reversal audit entry and restore the employee balance."
        onConfirm={async () => {
          if (!paymentToReverseId) {
            return;
          }
          await reversePayment(paymentToReverseId);
          setPaymentToReverseId(null);
        }}
        confirmText="Reverse Payment"
        variant="destructive"
        loading={Boolean(
          paymentToReverseId && reversingPaymentId === paymentToReverseId,
        )}
      />
    </PageShell>
  );
}

export default withRoleGuard(PaymentsPage, { all: ["payments.manage"] });
