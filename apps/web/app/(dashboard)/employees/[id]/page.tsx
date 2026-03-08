"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { AccountCreationDialog } from "@/components/employees/AccountCreationDialog";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { EmployeeDetailBreadcrumb } from "@/components/employees/detail/employee-detail-breadcrumb";
import { EmployeeDetailHeader } from "@/components/employees/detail/employee-detail-header";
import { EmployeeFinancialCards } from "@/components/employees/detail/employee-financial-cards";
import { EmployeeProfileSidebar } from "@/components/employees/detail/employee-profile-sidebar";
import { EmployeeDetailTabs } from "@/components/employees/detail/employee-detail-tabs";
import { EmployeeDocumentUploadDialog } from "@/components/employees/detail/employee-document-upload-dialog";
import { EmployeeLedgerEntryDialog } from "@/components/employees/detail/employee-ledger-entry-dialog";
import { EmployeeDetailSkeleton } from "@/components/employees/detail/employee-detail-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DetailSplit, PageSection, PageShell } from "@/components/ui/page-shell";
import { useEmployeeDetailPage } from "@/hooks/use-employee-detail-page";
import { useAuthz } from "@/hooks/use-authz";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PERMISSION } from '@tbms/shared-constants';

function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { canAll } = useAuthz();
  const [ledgerEntryToReverseId, setLedgerEntryToReverseId] = useState<
    string | null
  >(null);
  const canManageEmployees = canAll([PERMISSION["employees.manage"]]);
  const canManageAccounts = canAll([PERMISSION["users.manage"]]);
  const canManageLedger = canAll([PERMISSION["ledger.manage"]]);
  const canManageTaskStatus = canAll([PERMISSION["tasks.update"]]);
  const employeeId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    loading,
    employee,
    stats,
    items,
    tasks,
    attendance,
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
    submitLedgerEntry,
    reverseLedgerEntry,
  } = useEmployeeDetailPage({ employeeId });

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
            onClick: () => router.push("/employees"),
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
          onBack={() => router.push("/employees")}
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
        <EmployeeFinancialCards stats={stats} />
      </PageSection>

      <PageSection spacing="compact">
        <DetailSplit
          ratio="3-2"
          sideClassName="order-1 md:order-none"
          mainClassName="order-2 md:order-none"
          main={
            <EmployeeDetailTabs
              loading={loading}
              employee={employee}
              systemSettings={systemSettings}
              items={items}
              tasks={tasks}
              attendance={attendance}
              garmentTypes={garmentTypes}
              capabilities={capabilities}
              compensationHistory={compensationHistory}
              ledgerEntries={ledgerEntries}
              ledgerLoading={ledgerLoading}
              ledgerFrom={ledgerFrom}
              ledgerTo={ledgerTo}
              ledgerType={ledgerType}
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
              onReverseLedgerEntry={setLedgerEntryToReverseId}
              onViewOrder={(orderId) => router.push(`/orders/${orderId}`)}
              onOpenDocumentDialog={() => setDocumentDialogOpen(true)}
              onOpenAccountDialog={() => setAccountDialogOpen(true)}
              onOpenLedgerDialog={() => setLedgerDialogOpen(true)}
              onSaveCapabilitiesSnapshot={saveCapabilitiesSnapshot}
              onScheduleCompensationChange={scheduleCompensationChange}
              canManageTaskStatus={canManageTaskStatus}
              canManageLedger={canManageLedger}
              canManageDocuments={canManageEmployees}
              canManageAccount={canManageAccounts}
              canManageWorkforceGovernance={canManageEmployees}
            />
          }
          side={<EmployeeProfileSidebar employee={employee} />}
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
        open={Boolean(ledgerEntryToReverseId)}
        onOpenChange={(open) => {
          if (!open) {
            setLedgerEntryToReverseId(null);
          }
        }}
        title="Reverse this ledger entry?"
        description="This will create an audit reversal and recalculate the employee ledger."
        onConfirm={async () => {
          if (!ledgerEntryToReverseId) {
            return;
          }
          await reverseLedgerEntry(ledgerEntryToReverseId);
          setLedgerEntryToReverseId(null);
        }}
        confirmText="Reverse Entry"
        variant="destructive"
      />
    </PageShell>
  );
}

export default withRoleGuard(EmployeeDetailPage, { all: [PERMISSION["employees.read"]] });
