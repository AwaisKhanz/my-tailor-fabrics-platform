"use client";

import { useMemo } from "react";
import type {
  AttendanceRecord,
  CompensationChangeInput,
  EmployeeCapability,
  EmployeeCapabilitySnapshot,
  EmployeeCompensationHistoryEntry,
  EmployeeLedgerEntry,
  GarmentType,
  OrderItem,
  OrderItemTask,
  SystemSettings,
} from "@tbms/shared-types";
import { TaskStatus } from "@tbms/shared-types";
import type { EmployeeWithRelations } from "@/lib/api/employees";
import { type ColumnDef } from "@/components/ui/data-table";
import { useEmployeeCapabilitiesManager } from "@/hooks/use-employee-capabilities-manager";
import { useEmployeeCompensationManager } from "@/hooks/use-employee-compensation-manager";
import { useEmployeeDetailTabsTableState } from "@/hooks/use-employee-detail-tabs-table-state";
import { EMPLOYEE_LEDGER_ALL_TYPES_LABEL } from "@/hooks/use-employee-ledger-manager";
import { EmployeeAccountSection } from "@/components/employees/detail/employee-account-section";
import { EmployeeAttendanceSection } from "@/components/employees/detail/employee-attendance-section";
import { EmployeeCapabilitiesSection } from "@/components/employees/detail/employee-capabilities-section";
import {
  createEmployeeAttendanceColumns,
  createEmployeeHistoryColumns,
  createEmployeeLedgerColumns,
  createEmployeeTaskColumns,
} from "@/components/employees/detail/employee-detail-columns";
import { EmployeeCompensationSection } from "@/components/employees/detail/employee-compensation-section";
import { EmployeeDocumentsSection } from "@/components/employees/detail/employee-documents-section";
import { EmployeeLedgerSection } from "@/components/employees/detail/employee-ledger-section";
import { EmployeeProductionTasksSection } from "@/components/employees/detail/employee-production-tasks-section";
import { EmployeeWorkHistorySection } from "@/components/employees/detail/employee-work-history-section";
interface EmployeeDetailTabsProps {
  loading: boolean;
  employee: EmployeeWithRelations;
  systemSettings: SystemSettings | null;
  items: OrderItem[];
  tasks: OrderItemTask[];
  attendance: AttendanceRecord[];
  garmentTypes: GarmentType[];
  capabilities: EmployeeCapability[];
  compensationHistory: EmployeeCompensationHistoryEntry[];
  ledgerEntries: EmployeeLedgerEntry[];
  ledgerLoading: boolean;
  ledgerFrom: string;
  ledgerTo: string;
  ledgerType: string;
  ledgerTypeFilterOptions: {
    value: string;
    label: string;
  }[];
  ledgerPage: number;
  ledgerTotal: number;
  ledgerLimit: number;
  setLedgerFrom: (value: string) => void;
  setLedgerTo: (value: string) => void;
  setLedgerType: (value: string) => void;
  onFetchLedger: (page?: number) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onReverseLedgerEntry: (entryId: string) => void;
  onViewOrder: (orderId: string) => void;
  onOpenDocumentDialog: () => void;
  onOpenAccountDialog: () => void;
  onOpenLedgerDialog: () => void;
  onSaveCapabilitiesSnapshot: (
    snapshot: EmployeeCapabilitySnapshot,
  ) => Promise<boolean>;
  onScheduleCompensationChange: (
    change: CompensationChangeInput,
  ) => Promise<boolean>;
  canManageTaskStatus?: boolean;
  canManageLedger?: boolean;
  canManageDocuments?: boolean;
  canManageAccount?: boolean;
  canManageWorkforceGovernance?: boolean;
}

export function EmployeeDetailTabs({
  loading,
  employee,
  systemSettings,
  items,
  tasks,
  attendance,
  garmentTypes,
  capabilities,
  compensationHistory,
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
  onFetchLedger,
  onTaskStatusChange,
  onReverseLedgerEntry,
  onViewOrder,
  onOpenDocumentDialog,
  onOpenAccountDialog,
  onOpenLedgerDialog,
  onSaveCapabilitiesSnapshot,
  onScheduleCompensationChange,
  canManageTaskStatus = true,
  canManageLedger = true,
  canManageDocuments = true,
  canManageAccount = true,
  canManageWorkforceGovernance = true,
}: EmployeeDetailTabsProps) {
  const {
    taskPage,
    taskLimit,
    taskTotal,
    setTaskPage,
    pagedTasks,
    historyPage,
    historyLimit,
    historyTotal,
    setHistoryPage,
    pagedItems,
    attendancePage,
    attendanceLimit,
    attendanceTotal,
    setAttendancePage,
    pagedAttendance,
  } = useEmployeeDetailTabsTableState({
    tasks,
    items,
    attendance,
  });

  const {
    activeCapabilities,
    garmentNameById,
    capabilityEffectiveFrom,
    capabilityNote,
    capabilityRows,
    capabilityValidationError,
    setCapabilityEffectiveFrom,
    setCapabilityNote,
    addCapabilityRow,
    removeCapabilityRow,
    updateCapabilityRow,
    getStepOptionsForCapabilityRow,
    submitCapabilitiesSnapshot,
  } = useEmployeeCapabilitiesManager({
    capabilities,
    garmentTypes,
    onSaveCapabilitiesSnapshot,
  });
  const {
    paymentType: compensationPaymentType,
    monthlySalary: compensationMonthlySalary,
    effectiveFrom: compensationEffectiveFrom,
    note: compensationNote,
    fieldErrors: compensationFieldErrors,
    validationError: compensationValidationError,
    setPaymentType: setCompensationPaymentType,
    setMonthlySalary: setCompensationMonthlySalary,
    setEffectiveFrom: setCompensationEffectiveFrom,
    setNote: setCompensationNote,
    clearFieldError: clearCompensationFieldError,
    clearValidationError: clearCompensationValidationError,
    submitCompensationChange,
  } = useEmployeeCompensationManager({
    employee,
    onScheduleCompensationChange,
  });

  const historyColumns: ColumnDef<OrderItem>[] = useMemo(
    () => createEmployeeHistoryColumns(onViewOrder),
    [onViewOrder],
  );

  const attendanceColumns: ColumnDef<AttendanceRecord>[] = useMemo(
    () => createEmployeeAttendanceColumns(),
    [],
  );

  const taskColumns: ColumnDef<OrderItemTask>[] = useMemo(
    () =>
      createEmployeeTaskColumns({
        canManageTaskStatus,
        onTaskStatusChange,
      }),
    [canManageTaskStatus, onTaskStatusChange],
  );

  const ledgerColumns: ColumnDef<EmployeeLedgerEntry>[] = useMemo(
    () =>
      createEmployeeLedgerColumns({
        canManageLedger,
        onReverseLedgerEntry,
      }),
    [canManageLedger, onReverseLedgerEntry],
  );

  return (
    <div className="space-y-6">
      <EmployeeCapabilitiesSection
        activeCapabilities={activeCapabilities}
        garmentTypes={garmentTypes}
        garmentNameById={garmentNameById}
        capabilityEffectiveFrom={capabilityEffectiveFrom}
        capabilityNote={capabilityNote}
        capabilityRows={capabilityRows}
        capabilityValidationError={capabilityValidationError}
        canManageWorkforceGovernance={canManageWorkforceGovernance}
        setCapabilityEffectiveFrom={setCapabilityEffectiveFrom}
        setCapabilityNote={setCapabilityNote}
        addCapabilityRow={addCapabilityRow}
        removeCapabilityRow={removeCapabilityRow}
        updateCapabilityRow={updateCapabilityRow}
        getStepOptionsForCapabilityRow={getStepOptionsForCapabilityRow}
        onSubmit={submitCapabilitiesSnapshot}
      />

      <EmployeeCompensationSection
        compensationHistory={compensationHistory}
        canManageWorkforceGovernance={canManageWorkforceGovernance}
        paymentType={compensationPaymentType}
        monthlySalary={compensationMonthlySalary}
        effectiveFrom={compensationEffectiveFrom}
        note={compensationNote}
        fieldErrors={compensationFieldErrors}
        validationError={compensationValidationError}
        setPaymentType={setCompensationPaymentType}
        setMonthlySalary={setCompensationMonthlySalary}
        setEffectiveFrom={setCompensationEffectiveFrom}
        setNote={setCompensationNote}
        clearFieldError={clearCompensationFieldError}
        clearValidationError={clearCompensationValidationError}
        onSubmit={submitCompensationChange}
      />

      {systemSettings?.useTaskWorkflow ? (
        <EmployeeProductionTasksSection
          tasks={pagedTasks}
          loading={loading}
          page={taskPage}
          total={taskTotal}
          limit={taskLimit}
          columns={taskColumns}
          onPageChange={setTaskPage}
        />
      ) : null}

      <EmployeeWorkHistorySection
        items={pagedItems}
        loading={loading}
        page={historyPage}
        total={historyTotal}
        limit={historyLimit}
        columns={historyColumns}
        onPageChange={setHistoryPage}
      />

      <EmployeeLedgerSection
        ledgerEntries={ledgerEntries}
        ledgerLoading={ledgerLoading}
        ledgerFrom={ledgerFrom}
        ledgerTo={ledgerTo}
        ledgerType={ledgerType}
        ledgerTypeFilterOptions={ledgerTypeFilterOptions}
        ledgerPage={ledgerPage}
        ledgerTotal={ledgerTotal}
        ledgerLimit={ledgerLimit}
        columns={ledgerColumns}
        canManageLedger={canManageLedger}
        allTypesLabel={EMPLOYEE_LEDGER_ALL_TYPES_LABEL}
        setLedgerFrom={setLedgerFrom}
        setLedgerTo={setLedgerTo}
        setLedgerType={setLedgerType}
        onFetchLedger={onFetchLedger}
        onOpenLedgerDialog={onOpenLedgerDialog}
      />

      <EmployeeAttendanceSection
        attendance={pagedAttendance}
        loading={loading}
        page={attendancePage}
        total={attendanceTotal}
        limit={attendanceLimit}
        columns={attendanceColumns}
        onPageChange={setAttendancePage}
      />

      <EmployeeDocumentsSection
        documents={employee.documents}
        canManageDocuments={canManageDocuments}
        onOpenDocumentDialog={onOpenDocumentDialog}
      />

      <EmployeeAccountSection
        employee={employee}
        canManageAccount={canManageAccount}
        onOpenAccountDialog={onOpenAccountDialog}
      />
    </div>
  );
}
