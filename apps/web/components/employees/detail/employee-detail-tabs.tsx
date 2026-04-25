"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import type {
  CompensationChangeInput,
  EmployeeCapabilitySnapshot,
  EmployeeCompensationHistoryEntry,
  EmployeeLedgerEntry,
  EmployeeWithRelations,
  GarmentType,
  OrderItem,
  OrderItemTask,
  SystemSettings,
} from "@tbms/shared-types";
import { TaskStatus } from "@tbms/shared-types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tbms/ui/components/tabs";
import { Card, CardContent } from "@tbms/ui/components/card";
import { useEmployeeCapabilitiesManager } from "@/hooks/use-employee-capabilities-manager";
import { useEmployeeCompensationManager } from "@/hooks/use-employee-compensation-manager";
import { useEmployeeDetailTabsTableState } from "@/hooks/use-employee-detail-tabs-table-state";
import { EMPLOYEE_LEDGER_ALL_TYPES_LABEL } from "@/hooks/use-employee-ledger-manager";
import {
  createEmployeeHistoryColumns,
  createEmployeeLedgerColumns,
  createEmployeeTaskColumns,
} from "@/components/employees/detail/employee-detail-columns";
import { EmployeeOverviewTab } from "@/components/employees/detail/employee-overview-tab";
import { EmployeeWorkTab } from "@/components/employees/detail/employee-work-tab";
import { EmployeeMoneyTab } from "@/components/employees/detail/employee-money-tab";
import { EmployeeAdminTab } from "@/components/employees/detail/employee-admin-tab";

interface EmployeeDetailTabsProps {
  loading: boolean;
  employee: EmployeeWithRelations;
  systemSettings: SystemSettings | null;
  items: OrderItem[];
  tasks: OrderItemTask[];
  garmentTypes: GarmentType[];
  capabilities: import("@tbms/shared-types").EmployeeCapability[];
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
  canReadLedger?: boolean;
  canManageLedger?: boolean;
  canManageDocuments?: boolean;
  canManageAccount?: boolean;
  canManageWorkforceGovernance?: boolean;
}

const EMPLOYEE_TABS = [
  { key: "overview", label: "Overview" },
  { key: "work", label: "Work" },
  { key: "money", label: "Money" },
  { key: "admin", label: "Admin" },
] as const;

export function EmployeeDetailTabs({
  loading,
  employee,
  systemSettings,
  items,
  tasks,
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
  canReadLedger = true,
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
  } = useEmployeeDetailTabsTableState({
    tasks,
    items,
  });

  const {
    activeCapabilities,
    upcomingCapabilities,
    capabilitiesWithStatus,
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
        canManageLedger: canReadLedger && canManageLedger,
        onReverseLedgerEntry,
      }),
    [canManageLedger, canReadLedger, onReverseLedgerEntry],
  );

  const shouldShowTasksSection =
    systemSettings?.useTaskWorkflow ?? tasks.length > 0;
  const activeTaskCount = tasks.filter(
    (task) => task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELLED,
  ).length;

  return (
    <Card>
      <CardContent className="space-y-5 p-4 sm:p-5">
        <Tabs defaultValue="overview" className="flex flex-col gap-5">
          <div className="overflow-x-auto">
            <TabsList variant="line" className="min-w-max">
              {EMPLOYEE_TABS.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="px-3 py-2 text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview">
            <EmployeeOverviewTab
              employee={employee}
              activeTaskCount={activeTaskCount}
              capabilitiesWithStatus={capabilitiesWithStatus}
              garmentNameById={garmentNameById}
              compensationHistory={compensationHistory}
              tasks={tasks}
              ledgerEntries={ledgerEntries}
            />
          </TabsContent>

          <TabsContent value="work">
            <EmployeeWorkTab
              garmentTypes={garmentTypes}
              capabilitiesWithStatus={capabilitiesWithStatus}
              activeCapabilitiesCount={activeCapabilities.length}
              upcomingCapabilitiesCount={upcomingCapabilities.length}
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
              submitCapabilitiesSnapshot={submitCapabilitiesSnapshot}
              shouldShowTasksSection={shouldShowTasksSection}
              pagedTasks={pagedTasks}
              loading={loading}
              taskPage={taskPage}
              taskTotal={taskTotal}
              taskLimit={taskLimit}
              taskColumns={taskColumns}
              setTaskPage={setTaskPage}
              pagedItems={pagedItems}
              historyPage={historyPage}
              historyTotal={historyTotal}
              historyLimit={historyLimit}
              historyColumns={historyColumns}
              setHistoryPage={setHistoryPage}
            />
          </TabsContent>

          <TabsContent value="money">
            <EmployeeMoneyTab
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
              canManageLedger={canReadLedger && canManageLedger}
              allTypesLabel={EMPLOYEE_LEDGER_ALL_TYPES_LABEL}
              setLedgerFrom={setLedgerFrom}
              setLedgerTo={setLedgerTo}
              setLedgerType={setLedgerType}
              onFetchLedger={onFetchLedger}
              onOpenLedgerDialog={onOpenLedgerDialog}
            />
          </TabsContent>

          <TabsContent value="admin">
            <EmployeeAdminTab
              employee={employee}
              canManageDocuments={canManageDocuments}
              canManageAccount={canManageAccount}
              onOpenDocumentDialog={onOpenDocumentDialog}
              onOpenAccountDialog={onOpenAccountDialog}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
