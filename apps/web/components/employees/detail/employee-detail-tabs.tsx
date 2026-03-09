"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AttendanceRecord,
  CompensationChangeInput,
  EmployeeCapability,
  EmployeeCapabilitySnapshot,
  EmployeeCapabilityWindowInput,
  EmployeeCompensationHistoryEntry,
  EmployeeLedgerEntry,
  GarmentType,
  OrderItem,
  OrderItemTask,
  SystemSettings,
} from "@tbms/shared-types";
import {
  employeeCapabilitySnapshotFormSchema,
  employeeCompensationChangeFormSchema,
  PaymentType,
  TaskStatus,
} from "@tbms/shared-types";
import type { EmployeeWithRelations } from "@/lib/api/employees";
import { type ColumnDef } from "@/components/ui/data-table";
import { useUrlTableState } from "@/hooks/use-url-table-state";
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
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

const DEFAULT_TABLE_PAGE_SIZE = 10;

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

function toDateInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
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
  const { setValues: setTaskValues, getPositiveInt: getTaskInt } =
    useUrlTableState({
      prefix: "employeeTasks",
      defaults: {
        page: "1",
        limit: String(DEFAULT_TABLE_PAGE_SIZE),
      },
    });
  const { setValues: setHistoryValues, getPositiveInt: getHistoryInt } =
    useUrlTableState({
      prefix: "employeeHistory",
      defaults: {
        page: "1",
        limit: String(DEFAULT_TABLE_PAGE_SIZE),
      },
    });
  const { setValues: setAttendanceValues, getPositiveInt: getAttendanceInt } =
    useUrlTableState({
      prefix: "employeeAttendance",
      defaults: {
        page: "1",
        limit: String(DEFAULT_TABLE_PAGE_SIZE),
      },
    });

  const taskPage = getTaskInt("page", 1);
  const taskLimit = getTaskInt("limit", DEFAULT_TABLE_PAGE_SIZE);
  const taskTotal = tasks.length;
  const taskTotalPages = Math.max(1, Math.ceil(taskTotal / taskLimit));

  const historyPage = getHistoryInt("page", 1);
  const historyLimit = getHistoryInt("limit", DEFAULT_TABLE_PAGE_SIZE);
  const historyTotal = items.length;
  const historyTotalPages = Math.max(1, Math.ceil(historyTotal / historyLimit));

  const attendancePage = getAttendanceInt("page", 1);
  const attendanceLimit = getAttendanceInt("limit", DEFAULT_TABLE_PAGE_SIZE);
  const attendanceTotal = attendance.length;
  const attendanceTotalPages = Math.max(
    1,
    Math.ceil(attendanceTotal / attendanceLimit),
  );

  const setTaskPage = useCallback(
    (nextPage: number) => {
      setTaskValues({ page: String(nextPage) });
    },
    [setTaskValues],
  );

  const setHistoryPage = useCallback(
    (nextPage: number) => {
      setHistoryValues({ page: String(nextPage) });
    },
    [setHistoryValues],
  );

  const setAttendancePage = useCallback(
    (nextPage: number) => {
      setAttendanceValues({ page: String(nextPage) });
    },
    [setAttendanceValues],
  );

  useEffect(() => {
    if (taskPage > taskTotalPages) {
      setTaskPage(taskTotalPages);
    }
  }, [setTaskPage, taskPage, taskTotalPages]);

  useEffect(() => {
    if (historyPage > historyTotalPages) {
      setHistoryPage(historyTotalPages);
    }
  }, [historyPage, historyTotalPages, setHistoryPage]);

  useEffect(() => {
    if (attendancePage > attendanceTotalPages) {
      setAttendancePage(attendanceTotalPages);
    }
  }, [attendancePage, attendanceTotalPages, setAttendancePage]);

  const pagedTasks = useMemo(() => {
    const start = (taskPage - 1) * taskLimit;
    return tasks.slice(start, start + taskLimit);
  }, [taskLimit, taskPage, tasks]);

  const pagedItems = useMemo(() => {
    const start = (historyPage - 1) * historyLimit;
    return items.slice(start, start + historyLimit);
  }, [historyLimit, historyPage, items]);

  const pagedAttendance = useMemo(() => {
    const start = (attendancePage - 1) * attendanceLimit;
    return attendance.slice(start, start + attendanceLimit);
  }, [attendance, attendanceLimit, attendancePage]);

  const activeCapabilities = useMemo(() => {
    const now = new Date();
    return capabilities.filter((capability) => {
      const effectiveFrom = new Date(capability.effectiveFrom);
      const effectiveTo = capability.effectiveTo
        ? new Date(capability.effectiveTo)
        : null;
      return (
        effectiveFrom <= now &&
        (effectiveTo === null || effectiveTo >= now) &&
        !capability.deletedAt
      );
    });
  }, [capabilities]);
  const garmentNameById = useMemo(
    () =>
      new Map(
        garmentTypes.map((garmentType) => [garmentType.id, garmentType.name]),
      ),
    [garmentTypes],
  );
  const stepKeysByGarmentId = useMemo(() => {
    const map = new Map<string, string[]>();

    for (const garmentType of garmentTypes) {
      const orderedUniqueStepKeys = Array.from(
        new Set(
          (garmentType.workflowSteps ?? []).map(
            (workflowStep) => workflowStep.stepKey,
          ),
        ),
      );
      map.set(garmentType.id, orderedUniqueStepKeys);
    }

    return map;
  }, [garmentTypes]);
  const allWorkflowStepKeys = useMemo(() => {
    return Array.from(
      new Set(
        garmentTypes.flatMap((garmentType) =>
          (garmentType.workflowSteps ?? []).map(
            (workflowStep) => workflowStep.stepKey,
          ),
        ),
      ),
    );
  }, [garmentTypes]);
  const getStepOptionsForCapabilityRow = useCallback(
    (garmentTypeId?: string) => {
      if (garmentTypeId) {
        return stepKeysByGarmentId.get(garmentTypeId) ?? [];
      }
      return allWorkflowStepKeys;
    },
    [allWorkflowStepKeys, stepKeysByGarmentId],
  );

  const [capabilityEffectiveFrom, setCapabilityEffectiveFrom] =
    useState<string>(toDateInputValue(new Date().toISOString()));
  const [capabilityNote, setCapabilityNote] = useState<string>("");
  const [capabilityRows, setCapabilityRows] = useState<
    EmployeeCapabilityWindowInput[]
  >([{ garmentTypeId: "", stepKey: "", note: "" }]);
  const [capabilityValidationError, setCapabilityValidationError] =
    useState<string>("");

  useEffect(() => {
    const seededRows =
      activeCapabilities.length > 0
        ? activeCapabilities.map((capability) => ({
            garmentTypeId: capability.garmentTypeId ?? "",
            stepKey: capability.stepKey ?? "",
            note: capability.note ?? "",
          }))
        : [{ garmentTypeId: "", stepKey: "", note: "" }];
    setCapabilityRows(seededRows);
  }, [activeCapabilities]);

  const [compensationPaymentType, setCompensationPaymentType] =
    useState<PaymentType>(employee.paymentType);
  const [compensationMonthlySalary, setCompensationMonthlySalary] =
    useState<string>(
      employee.monthlySalary != null
        ? String(employee.monthlySalary / 100)
        : "",
    );
  const [compensationEffectiveFrom, setCompensationEffectiveFrom] =
    useState<string>(toDateInputValue(new Date().toISOString()));
  const [compensationNote, setCompensationNote] = useState<string>("");
  const [compensationFieldErrors, setCompensationFieldErrors] = useState<{
    paymentType?: string;
    monthlySalary?: string;
    effectiveFrom?: string;
    note?: string;
  }>({});
  const [compensationValidationError, setCompensationValidationError] =
    useState<string>("");

  useEffect(() => {
    setCompensationPaymentType(employee.paymentType);
    setCompensationMonthlySalary(
      employee.monthlySalary != null
        ? String(employee.monthlySalary / 100)
        : "",
    );
  }, [employee.monthlySalary, employee.paymentType]);

  const addCapabilityRow = useCallback(() => {
    setCapabilityValidationError("");
    setCapabilityRows((previous) => [
      ...previous,
      { garmentTypeId: "", stepKey: "", note: "" },
    ]);
  }, []);

  const removeCapabilityRow = useCallback((index: number) => {
    setCapabilityValidationError("");
    setCapabilityRows((previous) => {
      if (previous.length <= 1) {
        return previous;
      }
      return previous.filter((_, capabilityIndex) => capabilityIndex !== index);
    });
  }, []);

  const updateCapabilityRow = useCallback(
    (index: number, updater: Partial<EmployeeCapabilityWindowInput>) => {
      setCapabilityValidationError("");
      setCapabilityRows((previous) =>
        previous.map((row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                ...updater,
              }
            : row,
        ),
      );
    },
    [],
  );

  const submitCapabilitiesSnapshot = useCallback(() => {
    const normalizedRows = capabilityRows
      .map((row) => ({
        garmentTypeId: row.garmentTypeId?.trim() || undefined,
        stepKey: row.stepKey?.trim() || undefined,
        note: row.note?.trim() || undefined,
      }))
      .filter((row) => row.garmentTypeId || row.stepKey);

    const snapshot: EmployeeCapabilitySnapshot = {
      effectiveFrom: capabilityEffectiveFrom,
      note: capabilityNote || undefined,
      capabilities: normalizedRows,
    };
    const parsedResult =
      employeeCapabilitySnapshotFormSchema.safeParse(snapshot);
    if (!parsedResult.success) {
      setCapabilityValidationError(getFirstZodErrorMessage(parsedResult.error));
      return;
    }

    setCapabilityValidationError("");
    void onSaveCapabilitiesSnapshot(parsedResult.data);
  }, [
    capabilityEffectiveFrom,
    capabilityNote,
    capabilityRows,
    onSaveCapabilitiesSnapshot,
  ]);

  const submitCompensationChange = useCallback(() => {
    const payload: CompensationChangeInput = {
      paymentType: compensationPaymentType,
      monthlySalary:
        compensationPaymentType === PaymentType.MONTHLY_FIXED &&
        compensationMonthlySalary.length > 0
          ? Number(compensationMonthlySalary)
          : undefined,
      effectiveFrom: compensationEffectiveFrom,
      note: compensationNote || undefined,
    };

    const parsedResult =
      employeeCompensationChangeFormSchema.safeParse(payload);
    if (!parsedResult.success) {
      const flattenedErrors = parsedResult.error.flatten().fieldErrors;
      setCompensationFieldErrors({
        paymentType: flattenedErrors.paymentType?.[0],
        monthlySalary: flattenedErrors.monthlySalary?.[0],
        effectiveFrom: flattenedErrors.effectiveFrom?.[0],
        note: flattenedErrors.note?.[0],
      });
      setCompensationValidationError(
        getFirstZodErrorMessage(parsedResult.error),
      );
      return;
    }

    setCompensationFieldErrors({});
    setCompensationValidationError("");
    void onScheduleCompensationChange(parsedResult.data);
  }, [
    compensationEffectiveFrom,
    compensationMonthlySalary,
    compensationNote,
    compensationPaymentType,
    onScheduleCompensationChange,
  ]);

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
        clearFieldError={(field) =>
          setCompensationFieldErrors((previous) => ({
            ...previous,
            [field]: undefined,
          }))
        }
        clearValidationError={() => setCompensationValidationError("")}
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
