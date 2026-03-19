"use client";

import type {
  EmployeeCapabilityWindowInput,
  GarmentType,
  OrderItem,
  OrderItemTask,
} from "@tbms/shared-types";
import type { ColumnDef } from "@tanstack/react-table";
import { EmployeeCapabilitiesSection } from "@/components/employees/detail/employee-capabilities-section";
import { EmployeeProductionTasksSection } from "@/components/employees/detail/employee-production-tasks-section";
import { EmployeeWorkHistorySection } from "@/components/employees/detail/employee-work-history-section";
import type { EmployeeCapabilityWithStatus } from "@/hooks/use-employee-capabilities-manager";

interface EmployeeWorkTabProps {
  garmentTypes: GarmentType[];
  capabilitiesWithStatus: EmployeeCapabilityWithStatus[];
  activeCapabilitiesCount: number;
  upcomingCapabilitiesCount: number;
  garmentNameById: Map<string, string>;
  capabilityEffectiveFrom: string;
  capabilityNote: string;
  capabilityRows: EmployeeCapabilityWindowInput[];
  capabilityValidationError: string;
  canManageWorkforceGovernance: boolean;
  setCapabilityEffectiveFrom: (value: string) => void;
  setCapabilityNote: (value: string) => void;
  addCapabilityRow: () => void;
  removeCapabilityRow: (index: number) => void;
  updateCapabilityRow: (
    index: number,
    updater: Partial<EmployeeCapabilityWindowInput>,
  ) => void;
  getStepOptionsForCapabilityRow: (garmentTypeId?: string) => string[];
  submitCapabilitiesSnapshot: () => void;
  shouldShowTasksSection: boolean;
  pagedTasks: OrderItemTask[];
  loading: boolean;
  taskPage: number;
  taskTotal: number;
  taskLimit: number;
  taskColumns: ColumnDef<OrderItemTask>[];
  setTaskPage: (page: number) => void;
  pagedItems: OrderItem[];
  historyPage: number;
  historyTotal: number;
  historyLimit: number;
  historyColumns: ColumnDef<OrderItem>[];
  setHistoryPage: (page: number) => void;
}

export function EmployeeWorkTab({
  garmentTypes,
  capabilitiesWithStatus,
  activeCapabilitiesCount,
  upcomingCapabilitiesCount,
  garmentNameById,
  capabilityEffectiveFrom,
  capabilityNote,
  capabilityRows,
  capabilityValidationError,
  canManageWorkforceGovernance,
  setCapabilityEffectiveFrom,
  setCapabilityNote,
  addCapabilityRow,
  removeCapabilityRow,
  updateCapabilityRow,
  getStepOptionsForCapabilityRow,
  submitCapabilitiesSnapshot,
  shouldShowTasksSection,
  pagedTasks,
  loading,
  taskPage,
  taskTotal,
  taskLimit,
  taskColumns,
  setTaskPage,
  pagedItems,
  historyPage,
  historyTotal,
  historyLimit,
  historyColumns,
  setHistoryPage,
}: EmployeeWorkTabProps) {
  return (
    <div className="space-y-6">
      <EmployeeCapabilitiesSection
        capabilitiesWithStatus={capabilitiesWithStatus}
        activeCapabilitiesCount={activeCapabilitiesCount}
        upcomingCapabilitiesCount={upcomingCapabilitiesCount}
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

      {shouldShowTasksSection ? (
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
    </div>
  );
}
