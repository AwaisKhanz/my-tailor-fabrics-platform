"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
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
import {
  LEDGER_ENTRY_TYPE_BADGE,
  LEDGER_ENTRY_TYPE_LABELS,
  PAYMENT_TYPE_LABELS,
  TASK_STATUS_LABELS,
  getEffectiveTaskRate,
} from "@tbms/shared-constants";
import type { EmployeeWithRelations } from "@/lib/api/employees";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heading, Text } from "@/components/ui/typography";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { cn, formatDate, formatDateTime, formatPKR } from "@/lib/utils";
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

interface EmployeeSectionProps {
  id: string;
  title: string;
  description: string;
  badge?: ReactNode;
  action?: ReactNode;
  defaultOpen?: boolean;
  onFirstOpen?: () => void;
  children: ReactNode;
}

function EmployeeSection({
  id,
  title,
  description,
  badge,
  action,
  defaultOpen = true,
  onFirstOpen,
  children,
}: EmployeeSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const openedRef = useRef(false);

  useEffect(() => {
    if (!defaultOpen || openedRef.current || !onFirstOpen) {
      return;
    }

    openedRef.current = true;
    onFirstOpen();
  }, [defaultOpen, onFirstOpen]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);

    if (next && !openedRef.current && onFirstOpen) {
      openedRef.current = true;
      onFirstOpen();
    }
  };

  return (
    <Card id={id}>
      <CardHeader
        layout="rowBetweenResponsive"
        surface="mutedSection"
        trimBottom
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{title}</CardTitle>
            {badge}
          </div>
          <Text as="p" variant="muted">
            {description}
          </Text>
        </div>

        <div className="ml-auto flex w-full items-center justify-end gap-2 sm:w-auto">
          {action}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-expanded={isOpen}
            aria-controls={`${id}-content`}
            onClick={handleToggle}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </Button>
        </div>
      </CardHeader>

      {isOpen ? (
        <CardContent id={`${id}-content`} spacing="section" className="p-0">
          {children}
        </CardContent>
      ) : null}
    </Card>
  );
}

function isTaskStatus(value: string): value is TaskStatus {
  switch (value) {
    case TaskStatus.PENDING:
    case TaskStatus.IN_PROGRESS:
    case TaskStatus.DONE:
    case TaskStatus.CANCELLED:
      return true;
    default:
      return false;
  }
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

  const historyColumns: ColumnDef<OrderItem>[] = [
    {
      header: "Order #",
      cell: (item) => (
        <span className="font-bold">{item.order?.orderNumber || "-"}</span>
      ),
    },
    {
      header: "Garment",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.garmentTypeName}</span>
          <span className="text-xs text-muted-foreground">
            {item.completedAt
              ? `Completed: ${formatDate(item.completedAt)}`
              : "Pending"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge variant="outline" className="scale-90">
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Price",
      align: "right",
      cell: (item) => (
        <span className="text-right font-bold text-primary">
          {formatPKR(item.unitPrice)}
        </span>
      ),
    },
    {
      header: "",
      align: "right",
      cell: (item) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewOrder(item.orderId)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const attendanceColumns: ColumnDef<AttendanceRecord>[] = [
    {
      header: "Date",
      cell: (record) => (
        <span className="font-medium">{formatDate(record.date)}</span>
      ),
    },
    {
      header: "Clock In",
      cell: (record) => (
        <span className="text-xs font-medium text-primary">
          {new Date(record.clockIn).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      header: "Clock Out",
      cell: (record) => (
        <span className="text-xs font-medium text-destructive">
          {record.clockOut
            ? new Date(record.clockOut).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "---"}
        </span>
      ),
    },
    {
      header: "Hours",
      align: "right",
      cell: (record) => (
        <span className="font-bold">
          {record.hoursWorked?.toFixed(1) || "0.0"}h
        </span>
      ),
    },
  ];

  const taskColumns: ColumnDef<OrderItemTask>[] = [
    {
      header: "Order #",
      cell: (task) => (
        <span className="font-bold">{task.item?.order.orderNumber || "-"}</span>
      ),
    },
    {
      header: "Item/Step",
      cell: (task) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {task.item?.garmentTypeName || "-"}
          </span>
          <Label className="text-sm font-bold uppercase  text-muted-foreground font-mono">
            {task.stepName}
          </Label>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (task) => (
        <Select
          value={task.status}
          onValueChange={(value) => {
            if (isTaskStatus(value)) {
              onTaskStatusChange(task.id, value);
            }
          }}
          disabled={!canManageTaskStatus}
        >
          <SelectTrigger className="h-7 w-[130px] text-xs font-bold uppercase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
              <SelectItem
                key={key}
                value={key}
                className="text-xs font-bold uppercase"
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Rate",
      align: "right",
      cell: (task) => (
        <span className="font-bold text-primary">
          {formatPKR(
            getEffectiveTaskRate(
              task.rateSnapshot,
              task.rateOverride,
              task.designRateSnapshot,
            ),
          )}
        </span>
      ),
    },
    {
      header: "Last Update",
      align: "right",
      cell: (task) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(task.updatedAt)}
        </span>
      ),
    },
  ];

  const ledgerColumns: ColumnDef<EmployeeLedgerEntry>[] = [
    {
      header: "Date",
      cell: (entry) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(entry.createdAt)}
        </span>
      ),
    },
    {
      header: "Type",
      cell: (entry) => (
        <Badge variant={LEDGER_ENTRY_TYPE_BADGE[entry.type]} size="xs">
          {LEDGER_ENTRY_TYPE_LABELS[entry.type]}
        </Badge>
      ),
    },
    {
      header: "Amount",
      align: "right",
      cell: (entry) => (
        <span
          className={`text-sm font-bold ${entry.amount >= 0 ? "text-primary" : "text-destructive"}`}
        >
          {entry.amount >= 0 ? "+" : ""}
          {formatPKR(Math.abs(entry.amount))}
        </span>
      ),
    },
    {
      header: "Task / Note",
      cell: (entry) => (
        <div className="flex max-w-xs flex-col">
          {entry.orderItemTask ? (
            <span className="text-xs font-semibold">
              {entry.orderItemTask.stepName} -{" "}
              {entry.orderItemTask.orderItem?.garmentTypeName}
            </span>
          ) : null}
          {entry.note ? (
            <span className="text-xs text-muted-foreground">{entry.note}</span>
          ) : null}
        </div>
      ),
    },
    {
      header: "Order #",
      cell: (entry) => (
        <span className="text-xs text-muted-foreground">
          {entry.orderItemTask?.orderItem?.order?.orderNumber ?? "-"}
        </span>
      ),
    },
    {
      header: "Action",
      align: "right",
      cell: (entry) =>
        canManageLedger ? (
          <Button
            size="icon"
            className="h-7 w-7"
            onClick={() => onReverseLedgerEntry(entry.id)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <EmployeeSection
        id="employee-capabilities"
        title="Capabilities"
        description="Define which garments and steps this employee can be assigned to."
        badge={
          <Badge variant="default" size="xs" className="font-semibold">
            {activeCapabilities.length} ACTIVE
          </Badge>
        }
        defaultOpen
      >
        <div className="space-y-4 p-4 sm:p-5">
          <DataTable<EmployeeCapability>
            columns={[
              {
                header: "Garment Type",
                cell: (capability) => (
                  <span className="font-medium">
                    {capability.garmentTypeId
                      ? (garmentNameById.get(capability.garmentTypeId) ??
                        capability.garmentTypeId)
                      : "Any"}
                  </span>
                ),
              },
              {
                header: "Step Key",
                cell: (capability) => (
                  <span className="font-mono text-xs">
                    {capability.stepKey || "Any"}
                  </span>
                ),
              },
              {
                header: "Effective",
                cell: (capability) => (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(capability.effectiveFrom)}
                    {capability.effectiveTo
                      ? ` → ${formatDate(capability.effectiveTo)}`
                      : " onwards"}
                  </span>
                ),
              },
            ]}
            data={activeCapabilities}
            loading={false}
            chrome="flat"
            emptyMessage="No active capabilities configured."
          />

          {canManageWorkforceGovernance ? (
            <InfoTile tone="default" padding="contentLg" className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-bold uppercase  text-muted-foreground">
                    Effective From
                  </Label>
                  <Input
                    type="date"
                    value={capabilityEffectiveFrom}
                    onChange={(event) =>
                      setCapabilityEffectiveFrom(event.target.value)
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase  text-muted-foreground">
                    Snapshot Note
                  </Label>
                  <Input
                    value={capabilityNote}
                    onChange={(event) => setCapabilityNote(event.target.value)}
                    placeholder="Optional context for this update"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {capabilityRows.map((row, index) => {
                  const stepOptions = getStepOptionsForCapabilityRow(
                    row.garmentTypeId ?? undefined,
                  );
                  const visibleStepOptions =
                    row.stepKey && !stepOptions.includes(row.stepKey)
                      ? [row.stepKey, ...stepOptions]
                      : stepOptions;

                  return (
                    <div
                      key={`capability-row-${index}`}
                      className="grid grid-cols-1 gap-2 rounded-xl border border-border p-3 md:grid-cols-12"
                    >
                      <div className="md:col-span-4">
                        <Label className="text-sm font-bold uppercase  text-muted-foreground">
                          Garment Type
                        </Label>
                        <Select
                          value={row.garmentTypeId || "ANY"}
                          onValueChange={(value) => {
                            const nextGarmentTypeId =
                              value === "ANY" ? "" : value;
                            const stepOptions =
                              getStepOptionsForCapabilityRow(nextGarmentTypeId);
                            updateCapabilityRow(index, {
                              garmentTypeId: nextGarmentTypeId,
                              stepKey:
                                row.stepKey && stepOptions.includes(row.stepKey)
                                  ? row.stepKey
                                  : "",
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any garment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ANY">Any garment</SelectItem>
                            {garmentTypes.map((garmentType) => (
                              <SelectItem
                                key={garmentType.id}
                                value={garmentType.id}
                              >
                                {garmentType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-4">
                        <Label className="text-sm font-bold uppercase  text-muted-foreground">
                          Step Key
                        </Label>
                        <Select
                          value={row.stepKey || "ANY_STEP"}
                          onValueChange={(value) =>
                            updateCapabilityRow(index, {
                              stepKey: value === "ANY_STEP" ? "" : value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any step" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ANY_STEP">Any step</SelectItem>
                            {visibleStepOptions.map((stepKey) => (
                              <SelectItem key={stepKey} value={stepKey}>
                                {stepKey}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {row.garmentTypeId && stepOptions.length === 0 ? (
                          <Text
                            as="p"
                            variant="muted"
                            className="mt-1 text-xs text-secondary-foreground"
                          >
                            No workflow steps configured for this garment.
                          </Text>
                        ) : null}
                      </div>
                      <div className="md:col-span-3">
                        <Label className="text-sm font-bold uppercase  text-muted-foreground">
                          Note
                        </Label>
                        <Input
                          value={row.note ?? ""}
                          onChange={(event) =>
                            updateCapabilityRow(index, {
                              note: event.target.value,
                            })
                          }
                          placeholder="Optional"
                        />
                      </div>
                      <div className="flex items-end md:col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeCapabilityRow(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCapabilityRow}
                >
                  <Plus className="h-4 w-4" />
                  Add Capability
                </Button>
                <div className="flex flex-col items-end gap-2">
                  {capabilityValidationError ? (
                    <p className="text-sm text-destructive">
                      {capabilityValidationError}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    onClick={submitCapabilitiesSnapshot}
                  >
                    Save Capability Snapshot
                  </Button>
                </div>
              </div>
            </InfoTile>
          ) : null}
        </div>
      </EmployeeSection>

      <EmployeeSection
        id="employee-compensation"
        title="Compensation Timeline"
        description="Track payment model and salary changes over time."
        badge={
          <Badge variant="default" size="xs" className="font-semibold">
            {compensationHistory.length} CHANGES
          </Badge>
        }
        defaultOpen={false}
      >
        <div className="space-y-4 p-4 sm:p-5">
          <DataTable<EmployeeCompensationHistoryEntry>
            columns={[
              {
                header: "Model",
                cell: (entry) => (
                  <Badge variant="outline" size="xs">
                    {PAYMENT_TYPE_LABELS[entry.paymentType]}
                  </Badge>
                ),
              },
              {
                header: "Monthly Salary",
                align: "right",
                cell: (entry) => (
                  <span className="font-medium">
                    {entry.monthlySalary != null
                      ? formatPKR(entry.monthlySalary)
                      : "-"}
                  </span>
                ),
              },
              {
                header: "Window",
                cell: (entry) => (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(entry.effectiveFrom)}
                    {entry.effectiveTo
                      ? ` → ${formatDate(entry.effectiveTo)}`
                      : " onwards"}
                  </span>
                ),
              },
            ]}
            data={compensationHistory}
            loading={false}
            chrome="flat"
            emptyMessage="No compensation history available."
          />

          {canManageWorkforceGovernance ? (
            <InfoTile tone="default" padding="contentLg" className="space-y-4">
              {compensationValidationError ? (
                <p className="text-sm text-destructive">
                  {compensationValidationError}
                </p>
              ) : null}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div>
                  <Label className="text-sm font-bold uppercase  text-muted-foreground">
                    Payment Model
                  </Label>
                  <Select
                    value={compensationPaymentType}
                    onValueChange={(value) => {
                      if (
                        value === PaymentType.PER_PIECE ||
                        value === PaymentType.MONTHLY_FIXED
                      ) {
                        setCompensationFieldErrors((previous) => ({
                          ...previous,
                          paymentType: undefined,
                        }));
                        setCompensationValidationError("");
                        setCompensationPaymentType(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentType.PER_PIECE}>
                        Per Piece
                      </SelectItem>
                      <SelectItem value={PaymentType.MONTHLY_FIXED}>
                        Monthly Fixed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {compensationFieldErrors.paymentType ? (
                    <p className="mt-1 text-xs text-destructive">
                      {compensationFieldErrors.paymentType}
                    </p>
                  ) : null}
                </div>

                {compensationPaymentType === PaymentType.MONTHLY_FIXED ? (
                  <div>
                    <Label className="text-sm font-bold uppercase  text-muted-foreground">
                      Monthly Salary (Rs)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={compensationMonthlySalary}
                      onChange={(event) => {
                        setCompensationFieldErrors((previous) => ({
                          ...previous,
                          monthlySalary: undefined,
                        }));
                        setCompensationValidationError("");
                        setCompensationMonthlySalary(event.target.value);
                      }}
                    />
                    {compensationFieldErrors.monthlySalary ? (
                      <p className="mt-1 text-xs text-destructive">
                        {compensationFieldErrors.monthlySalary}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <Label className="text-sm font-bold uppercase  text-muted-foreground">
                    Effective From
                  </Label>
                  <Input
                    type="date"
                    value={compensationEffectiveFrom}
                    onChange={(event) => {
                      setCompensationFieldErrors((previous) => ({
                        ...previous,
                        effectiveFrom: undefined,
                      }));
                      setCompensationValidationError("");
                      setCompensationEffectiveFrom(event.target.value);
                    }}
                  />
                  {compensationFieldErrors.effectiveFrom ? (
                    <p className="mt-1 text-xs text-destructive">
                      {compensationFieldErrors.effectiveFrom}
                    </p>
                  ) : null}
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase  text-muted-foreground">
                    Note
                  </Label>
                  <Input
                    value={compensationNote}
                    onChange={(event) => {
                      setCompensationFieldErrors((previous) => ({
                        ...previous,
                        note: undefined,
                      }));
                      setCompensationValidationError("");
                      setCompensationNote(event.target.value);
                    }}
                    placeholder="Optional"
                  />
                  {compensationFieldErrors.note ? (
                    <p className="mt-1 text-xs text-destructive">
                      {compensationFieldErrors.note}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={submitCompensationChange}
                >
                  Schedule Compensation Change
                </Button>
              </div>
            </InfoTile>
          ) : null}
        </div>
      </EmployeeSection>

      {systemSettings?.useTaskWorkflow ? (
        <EmployeeSection
          id="employee-production"
          title="Production Tasks"
          description="Update assigned task statuses for this employee."
          badge={
            <Badge variant="default" size="xs" className="font-semibold">
              {tasks.length} TASKS
            </Badge>
          }
          defaultOpen
        >
          <DataTable
            columns={taskColumns}
            data={pagedTasks}
            loading={loading}
            emptyMessage="No assigned tasks found."
            chrome="flat"
            page={taskPage}
            total={taskTotal}
            limit={taskLimit}
            onPageChange={setTaskPage}
          />
        </EmployeeSection>
      ) : null}

      <EmployeeSection
        id="employee-history"
        title="Work History"
        description="Review completed and pending order items handled by this employee."
        badge={
          <Badge variant="default" size="xs" className="font-semibold">
            {items.length} ITEMS
          </Badge>
        }
        defaultOpen
      >
        <DataTable
          columns={historyColumns}
          data={pagedItems}
          loading={loading}
          emptyMessage="No work items found."
          chrome="flat"
          page={historyPage}
          total={historyTotal}
          limit={historyLimit}
          onPageChange={setHistoryPage}
        />
      </EmployeeSection>

      <EmployeeSection
        id="employee-ledger"
        title="Ledger"
        description="Track payouts, deductions, and adjustments with filterable history."
        badge={
          <Badge variant="default" size="xs" className="font-semibold">
            {ledgerTotal} ENTRIES
          </Badge>
        }
        action={
          canManageLedger ? (
            <Button
              size="sm"
              variant="default"
              className="h-8 w-full sm:w-auto"
              onClick={onOpenLedgerDialog}
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          ) : null
        }
        defaultOpen={false}
        onFirstOpen={() => {
          if (ledgerEntries.length === 0 && !ledgerLoading) {
            onFetchLedger(1);
          }
        }}
      >
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              type="date"
              className="h-8 w-full px-2 text-xs md:w-36"
              value={ledgerFrom}
              onChange={(event) => setLedgerFrom(event.target.value)}
            />
            <Input
              type="date"
              className="h-8 w-full px-2 text-xs md:w-36"
              value={ledgerTo}
              onChange={(event) => setLedgerTo(event.target.value)}
            />
            <Select value={ledgerType} onValueChange={setLedgerType}>
              <SelectTrigger className="h-8 w-full text-xs md:w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(LEDGER_ENTRY_TYPE_LABELS).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-full md:w-auto"
              onClick={() => onFetchLedger(1)}
            >
              Filter
            </Button>
          </div>

          <DataTable<EmployeeLedgerEntry>
            columns={ledgerColumns}
            data={ledgerEntries}
            loading={ledgerLoading}
            emptyMessage="No ledger entries found."
            chrome="flat"
            page={ledgerPage}
            total={ledgerTotal}
            limit={ledgerLimit}
            onPageChange={(nextPage) => onFetchLedger(nextPage)}
          />
        </div>
      </EmployeeSection>

      <EmployeeSection
        id="employee-attendance"
        title="Attendance"
        description="Review attendance logs and worked hours for this employee."
        badge={
          <Badge variant="default" size="xs" className="font-semibold">
            {attendance.length} RECORDS
          </Badge>
        }
        defaultOpen={false}
      >
        <DataTable
          columns={attendanceColumns}
          data={pagedAttendance}
          loading={loading}
          emptyMessage="No attendance records found."
          chrome="flat"
          page={attendancePage}
          total={attendanceTotal}
          limit={attendanceLimit}
          onPageChange={setAttendancePage}
        />
      </EmployeeSection>

      <EmployeeSection
        id="employee-documents"
        title="Documents"
        description="Manage verification and identity documents for this employee."
        badge={
          <Badge variant="default" size="xs" className="font-semibold">
            {employee.documents?.length ?? 0} FILES
          </Badge>
        }
        action={
          canManageDocuments ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-full sm:w-auto"
              onClick={onOpenDocumentDialog}
            >
              <Plus className="h-4 w-4" />
              Add Document
            </Button>
          ) : null
        }
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
          {employee.documents?.map((document) => (
            <InfoTile
              key={document.id}
              tone="default"
              padding="contentLg"
              layout="betweenGap"
              radius="xl"
              interaction="interactive"
            >
              <div className="flex items-center gap-4">
                <SectionIcon framed={false}>
                  <FileText className="h-6 w-6 text-primary" />
                </SectionIcon>
                <div>
                  <p className="text-sm font-bold">{document.label}</p>
                  <p className="text-xs font-bold uppercase  text-muted-foreground">
                    {document.fileType}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <a href={document.fileUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </InfoTile>
          ))}

          {!employee.documents || employee.documents.length === 0 ? (
            <InfoTile
              borderStyle="dashedStrong"
              padding="none"
              radius="xl"
              className="col-span-1 flex flex-col items-center justify-center py-14 text-muted-foreground sm:col-span-2"
            >
              <FileText className="mb-3 h-12 w-12 opacity-20" />
              <p className="text-sm font-medium">
                No documentation uploaded yet.
              </p>
            </InfoTile>
          ) : null}
        </div>
      </EmployeeSection>

      <EmployeeSection
        id="employee-account"
        title="Portal Account"
        description="Provision and review employee login access to the system."
        badge={
          <Badge
            variant={employee.userAccount ? "success" : "outline"}
            size="xs"
            className="font-semibold"
          >
            {employee.userAccount ? "ACTIVE" : "NOT PROVISIONED"}
          </Badge>
        }
        defaultOpen={false}
      >
        <div className="p-4 sm:p-5">
          {employee.userAccount ? (
            <Card className="bg-muted shadow-sm">
              <CardHeader density="compact" surface="cardSection" trimBottom>
                <SectionHeader
                  title="System Access Enabled"
                  titleClassName="text-sm"
                  description="This employee has an active portal account."
                  icon={
                    <SectionIcon tone="info" size="sm">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </SectionIcon>
                  }
                />
              </CardHeader>
              <CardContent spacing="section" className="space-y-4">
                <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                  <span className="text-muted-foreground">Login Email</span>
                  <span className="font-bold ">
                    {employee.userAccount.email}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline">
                    {employee.userAccount.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-5 py-10 text-center">
              <InfoTile
                tone="default"
                padding="none"
                className="rounded-full border-none p-4"
              >
                <ShieldCheck className="h-10 w-10 text-muted-foreground opacity-30" />
              </InfoTile>
              <div>
                <Heading as="h3" variant="section">
                  No Portal Account
                </Heading>
                <p className="mt-1 max-w-[300px] text-sm text-muted-foreground">
                  Provision an account to allow order tracking access.
                </p>
              </div>
              {canManageAccount ? (
                <Button
                  size="lg"
                  className="rounded-full px-8"
                  onClick={onOpenAccountDialog}
                >
                  Provision Account Now
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </EmployeeSection>
    </div>
  );
}
