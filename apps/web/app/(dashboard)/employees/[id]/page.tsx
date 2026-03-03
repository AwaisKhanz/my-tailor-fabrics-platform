"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { AccountCreationDialog } from "@/components/employees/AccountCreationDialog";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { EmployeeDetailHeader } from "@/components/employees/detail/employee-detail-header";
import { EmployeeFinancialCards } from "@/components/employees/detail/employee-financial-cards";
import { EmployeeProfileSidebar } from "@/components/employees/detail/employee-profile-sidebar";
import { EmployeeDetailTabs } from "@/components/employees/detail/employee-detail-tabs";
import { EmployeeDocumentUploadDialog } from "@/components/employees/detail/employee-document-upload-dialog";
import { EmployeeLedgerEntryDialog } from "@/components/employees/detail/employee-ledger-entry-dialog";
import { EmployeeDetailSkeleton } from "@/components/employees/detail/employee-detail-skeleton";
import { useEmployeeDetailPage } from "@/hooks/use-employee-detail-page";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = typeof params.id === "string" ? params.id : null;

  const {
    loading,
    employee,
    stats,
    items,
    tasks,
    attendance,
    systemSettings,
    fetchEmployeeData,
    handleTaskStatusChange,

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
    uploadingDocument,
    uploadDocument,

    newEntryType,
    setNewEntryType,
    newEntryAmount,
    setNewEntryAmount,
    newEntryNote,
    setNewEntryNote,
    submittingLedgerEntry,
    submitLedgerEntry,
    deleteLedgerEntry,
  } = useEmployeeDetailPage({ employeeId });

  if (loading) {
    return <EmployeeDetailSkeleton />;
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Typography as="h2" variant="sectionTitle">
          Employee not found
        </Typography>
        <Button variant="link" onClick={() => router.push("/employees")}>
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EmployeeDetailHeader
        employee={employee}
        onBack={() => router.push("/employees")}
        onProvisionAccount={() => setAccountDialogOpen(true)}
        onEditProfile={() => setEditDialogOpen(true)}
      />

      <EmployeeFinancialCards stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <EmployeeProfileSidebar employee={employee} />

        <EmployeeDetailTabs
          loading={loading}
          employee={employee}
          systemSettings={systemSettings}
          items={items}
          tasks={tasks}
          attendance={attendance}
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
          onDeleteLedgerEntry={(entryId) => {
            if (confirm("Are you sure you want to delete this ledger entry? This cannot be undone.")) {
              void deleteLedgerEntry(entryId);
            }
          }}
          onViewOrder={(orderId) => router.push(`/orders/${orderId}`)}
          onOpenDocumentDialog={() => setDocumentDialogOpen(true)}
          onOpenAccountDialog={() => setAccountDialogOpen(true)}
          onOpenLedgerDialog={() => setLedgerDialogOpen(true)}
        />
      </div>

      <EmployeeDocumentUploadDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        label={docLabel}
        url={docUrl}
        uploading={uploadingDocument}
        onLabelChange={setDocLabel}
        onUrlChange={setDocUrl}
        onSubmit={() => {
          void uploadDocument();
        }}
      />

      <AccountCreationDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        employee={employee}
        onSuccess={() => {
          void fetchEmployeeData();
        }}
      />

      <EmployeeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialData={employee}
        onSuccess={() => {
          void fetchEmployeeData();
        }}
      />

      <EmployeeLedgerEntryDialog
        open={ledgerDialogOpen}
        onOpenChange={setLedgerDialogOpen}
        employeeName={employee.fullName}
        entryType={newEntryType}
        amount={newEntryAmount}
        note={newEntryNote}
        submitting={submittingLedgerEntry}
        onEntryTypeChange={setNewEntryType}
        onAmountChange={setNewEntryAmount}
        onNoteChange={setNewEntryNote}
        onSubmit={() => {
          void submitLedgerEntry();
        }}
      />
    </div>
  );
}
