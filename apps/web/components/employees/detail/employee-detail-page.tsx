"use client";

import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { AccountCreationDialog } from "@/components/employees/AccountCreationDialog";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { EmployeeDetailBreadcrumb } from "@/components/employees/detail/employee-detail-breadcrumb";
import { EmployeeDetailHeader } from "@/components/employees/detail/employee-detail-header";
import { EmployeeDetailSkeleton } from "@/components/employees/detail/employee-detail-skeleton";
import { EmployeeDetailTabs } from "@/components/employees/detail/employee-detail-tabs";
import { EmployeeDocumentUploadDialog } from "@/components/employees/detail/employee-document-upload-dialog";
import { EmployeeLedgerEntryDialog } from "@/components/employees/detail/employee-ledger-entry-dialog";
import { EmployeeFinancialCards } from "@/components/employees/detail/employee-financial-cards";
import { ConfirmDialog } from "@tbms/ui/components/confirm-dialog";
import { EmptyState } from "@tbms/ui/components/empty-state";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { useAuthz } from "@/hooks/use-authz";
import { useEmployeeDetailPage } from "@/hooks/use-employee-detail-page";
import { buildOrderDetailRoute } from "@/lib/order-routes";
import { EMPLOYEES_ROUTE } from "@/lib/people-routes";
import { PERMISSION } from "@tbms/shared-constants";

type EmployeeDetailPageProps = {
  employeeId: string;
};

export function EmployeeDetailPage({ employeeId }: EmployeeDetailPageProps) {
  const router = useRouter();
  const { canAll, canAny } = useAuthz();
  const canManageEmployees = canAll([PERMISSION["employees.manage"]]);
  const canManageAccounts = canAll([PERMISSION["users.manage"]]);
  const canReadLedger = canAny([
    PERMISSION["ledger.read"],
    PERMISSION["ledger.manage"],
  ]);
  const canManageLedger = canAll([PERMISSION["ledger.manage"]]);
  const canManageTaskStatus = canAll([PERMISSION["tasks.update"]]);
  const canReadSystemSettings = canAll([
    PERMISSION["settings.read"],
    PERMISSION["system.manage"],
  ]);
  const {
    loading,
    employee,
    stats,
    items,
    tasks,
    systemSettings,
    garmentTypes,
    capabilities,
    compensationHistory,
    fetchEmployeeData,
    handleTaskStatusChange,
    saveCapabilitiesSnapshot,
    scheduleCompensationChange,
    ledgerEntries,
    ledgerLoading,
    ledgerFrom,
    ledgerTo,
    ledgerType,
    ledgerTypeFilterOptions,
    ledgerPage,
    ledgerTotal,
    ledgerLimit,
    setLedgerFrom,
    setLedgerTo,
    setLedgerType,
    fetchLedger,
    accountDialogOpen,
    setAccountDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    documentDialogOpen,
    setDocumentDialogOpen,
    ledgerDialogOpen,
    setLedgerDialogOpen,
    docLabel,
    setDocLabel,
    docUrl,
    setDocUrl,
    documentFieldErrors,
    documentValidationError,
    uploadingDocument,
    uploadDocument,
    newEntryType,
    setNewEntryType,
    newEntryAmount,
    setNewEntryAmount,
    newEntryNote,
    setNewEntryNote,
    ledgerEntryFieldErrors,
    ledgerEntryValidationError,
    submittingLedgerEntry,
    ledgerEntryToReverseId,
    submitLedgerEntry,
    requestLedgerEntryReverse,
    closeLedgerEntryReverseDialog,
    confirmLedgerEntryReverse,
  } = useEmployeeDetailPage({
    employeeId,
    canReadLedger,
    canReadSystemSettings,
  });

  const refreshEmployeeData = () => {
    void fetchEmployeeData();
  };

  if (loading) {
    return <EmployeeDetailSkeleton />;
  }

  if (!employee) {
    return (
      <PageShell>
        <EmptyState
          icon={AlertCircle}
          title="Employee not found"
          description="The requested employee record is unavailable or may have been removed."
          action={{
            label: "Back to Employees",
            onClick: () => router.push(EMPLOYEES_ROUTE),
          }}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageSection spacing="compact">
        <EmployeeDetailBreadcrumb
          employeeCode={employee.employeeCode}
          onBack={() => router.push(EMPLOYEES_ROUTE)}
        />

        <EmployeeDetailHeader
          employee={employee}
          canProvisionAccount={canManageAccounts}
          canEditProfile={canManageEmployees}
          onProvisionAccount={() => setAccountDialogOpen(true)}
          onEditProfile={() => setEditDialogOpen(true)}
        />
      </PageSection>

      <PageSection spacing="compact">
        <EmployeeFinancialCards
          stats={stats}
          activeTaskCount={tasks.filter(
            (task) => task.status !== "DONE" && task.status !== "CANCELLED",
          ).length}
        />
      </PageSection>

      <PageSection spacing="compact">
        <EmployeeDetailTabs
          loading={loading}
          employee={employee}
          systemSettings={systemSettings}
          items={items}
          tasks={tasks}
          garmentTypes={garmentTypes}
          capabilities={capabilities}
          compensationHistory={compensationHistory}
          ledgerEntries={ledgerEntries}
          ledgerLoading={ledgerLoading}
          ledgerFrom={ledgerFrom}
          ledgerTo={ledgerTo}
          ledgerType={ledgerType}
          ledgerTypeFilterOptions={ledgerTypeFilterOptions}
          ledgerPage={ledgerPage}
          ledgerTotal={ledgerTotal}
          ledgerLimit={ledgerLimit}
          setLedgerFrom={setLedgerFrom}
          setLedgerTo={setLedgerTo}
          setLedgerType={setLedgerType}
          onFetchLedger={(page) => {
            void fetchLedger(page);
          }}
          onTaskStatusChange={(taskId, status) => {
            void handleTaskStatusChange(taskId, status);
          }}
          onReverseLedgerEntry={requestLedgerEntryReverse}
          onViewOrder={(orderId) => router.push(buildOrderDetailRoute(orderId))}
          onOpenDocumentDialog={() => setDocumentDialogOpen(true)}
          onOpenAccountDialog={() => setAccountDialogOpen(true)}
          onOpenLedgerDialog={() => setLedgerDialogOpen(true)}
          onSaveCapabilitiesSnapshot={saveCapabilitiesSnapshot}
          onScheduleCompensationChange={scheduleCompensationChange}
          canManageTaskStatus={canManageTaskStatus}
          canReadLedger={canReadLedger}
          canManageLedger={canManageLedger}
          canManageDocuments={canManageEmployees}
          canManageAccount={canManageAccounts}
          canManageWorkforceGovernance={canManageEmployees}
        />
      </PageSection>

      {canManageAccounts ? (
        <AccountCreationDialog
          open={accountDialogOpen}
          onOpenChange={setAccountDialogOpen}
          employee={employee}
          onSuccess={refreshEmployeeData}
        />
      ) : null}

      {canManageLedger ? (
        <EmployeeLedgerEntryDialog
          open={ledgerDialogOpen}
          onOpenChange={setLedgerDialogOpen}
          employeeName={employee.fullName}
          entryType={newEntryType}
          amount={newEntryAmount}
          note={newEntryNote}
          submitting={submittingLedgerEntry}
          fieldErrors={ledgerEntryFieldErrors}
          validationError={ledgerEntryValidationError}
          onEntryTypeChange={setNewEntryType}
          onAmountChange={setNewEntryAmount}
          onNoteChange={setNewEntryNote}
          onSubmit={() => {
            void submitLedgerEntry();
          }}
        />
      ) : null}

      {canManageEmployees ? (
        <>
          <EmployeeDocumentUploadDialog
            open={documentDialogOpen}
            onOpenChange={setDocumentDialogOpen}
            label={docLabel}
            url={docUrl}
            uploading={uploadingDocument}
            fieldErrors={documentFieldErrors}
            validationError={documentValidationError}
            onLabelChange={setDocLabel}
            onUrlChange={setDocUrl}
            onSubmit={() => {
              void uploadDocument();
            }}
          />

          <EmployeeDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            initialData={employee}
            onSuccess={refreshEmployeeData}
          />
        </>
      ) : null}

      <ConfirmDialog
        open={ledgerEntryToReverseId !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeLedgerEntryReverseDialog(false);
          }
        }}
        title="Reverse Ledger Entry"
        description="This will create a reversing entry and keep the original record for audit history."
        confirmText="Reverse Entry"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          void confirmLedgerEntryReverse();
        }}
      />
    </PageShell>
  );
}
