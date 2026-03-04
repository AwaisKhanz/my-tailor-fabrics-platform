"use client";

import { Banknote } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell, PageSection } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { PaymentsDisburseDialog } from "@/components/payments/payments-disburse-dialog";
import { PaymentsEmployeeSelectorCard } from "@/components/payments/payments-employee-selector-card";
import { PaymentsHistorySection } from "@/components/payments/payments-history-section";
import { PaymentsSummaryCards } from "@/components/payments/payments-summary-cards";
import { usePaymentsPage } from "@/hooks/use-payments-page";
import { useAuthz } from "@/hooks/use-authz";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function PaymentsPage() {
  const { canAll } = useAuthz();
  const canManagePayments = canAll(["payments.manage"]);
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
    disbursing,
    currentBalance,
    canDisburse,
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
            canManagePayments && canDisburse ? (
              <Button variant="premium" size="lg" className="w-full sm:w-auto" onClick={openDisburseDialog}>
                <Banknote className="h-4 w-4" />
                Disburse Payment
              </Button>
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

      {selectedEmployeeId ? (
        <PageSection spacing="compact">
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
            onPageChange={setHistoryPage}
            onFromChange={setHistoryFrom}
            onToChange={setHistoryTo}
            onResetFilters={resetHistoryFilters}
          />
        </PageSection>
      ) : (
        <PageSection spacing="compact">
          <EmptyState
            icon={Banknote}
            title="No Employee Selected"
            description="Choose an employee above to view their outstanding balance and payment ledger."
          />
        </PageSection>
      )}

      {canManagePayments ? (
        <PaymentsDisburseDialog
          open={disburseOpen}
          loading={disbursing}
          employeeName={selectedEmployee?.fullName ?? "selected employee"}
          currentBalance={currentBalance}
          form={disburseForm}
          onOpenChange={closeDisburseDialog}
          onAmountChange={setDisbursementAmount}
          onNoteChange={setDisbursementNote}
          onSubmit={submitDisbursement}
        />
      ) : null}
    </PageShell>
  );
}

export default withRoleGuard(PaymentsPage, { all: ["payments.manage"] });
