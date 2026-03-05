"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type {
  AttendanceRecord,
  EmployeeLedgerEntry,
  OrderItem,
  OrderItemTask,
  SystemSettings,
} from "@tbms/shared-types";
import { TaskStatus } from "@tbms/shared-types";
import {
  LEDGER_ENTRY_TYPE_BADGE,
  LEDGER_ENTRY_TYPE_LABELS,
  TASK_STATUS_LABELS,
  getEffectiveTaskRate,
} from "@tbms/shared-constants";
import type { EmployeeWithRelations } from "@/lib/api/employees";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { cn, formatDate, formatDateTime, formatPKR } from "@/lib/utils";

const DEFAULT_TABLE_PAGE_SIZE = 10;

interface EmployeeDetailTabsProps {
  loading: boolean;
  employee: EmployeeWithRelations;
  systemSettings: SystemSettings | null;
  items: OrderItem[];
  tasks: OrderItemTask[];
  attendance: AttendanceRecord[];
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
  onDeleteLedgerEntry: (entryId: string) => void;
  onViewOrder: (orderId: string) => void;
  onOpenDocumentDialog: () => void;
  onOpenAccountDialog: () => void;
  onOpenLedgerDialog: () => void;
  canManageTaskStatus?: boolean;
  canManageLedger?: boolean;
  canManageDocuments?: boolean;
  canManageAccount?: boolean;
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
    <Card id={id} variant="premium">
      <CardHeader variant="rowSection" align="startResponsive" gap="md">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle variant="section">{title}</CardTitle>
            {badge}
          </div>
          <Typography as="p" variant="muted">
            {description}
          </Typography>
        </div>

        <div className="ml-auto flex w-full items-center justify-end gap-2 sm:w-auto">
          {action}
          <Button
            type="button"
            variant="tableIcon"
            size="iconSm"
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

export function EmployeeDetailTabs({
  loading,
  employee,
  systemSettings,
  items,
  tasks,
  attendance,
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
  onDeleteLedgerEntry,
  onViewOrder,
  onOpenDocumentDialog,
  onOpenAccountDialog,
  onOpenLedgerDialog,
  canManageTaskStatus = true,
  canManageLedger = true,
  canManageDocuments = true,
  canManageAccount = true,
}: EmployeeDetailTabsProps) {
  const { setValues: setTaskValues, getPositiveInt: getTaskInt } = useUrlTableState({
    prefix: "employeeTasks",
    defaults: {
      page: "1",
      limit: String(DEFAULT_TABLE_PAGE_SIZE),
    },
  });
  const { setValues: setHistoryValues, getPositiveInt: getHistoryInt } = useUrlTableState({
    prefix: "employeeHistory",
    defaults: {
      page: "1",
      limit: String(DEFAULT_TABLE_PAGE_SIZE),
    },
  });
  const { setValues: setAttendanceValues, getPositiveInt: getAttendanceInt } = useUrlTableState({
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
  const attendanceTotalPages = Math.max(1, Math.ceil(attendanceTotal / attendanceLimit));

  const setTaskPage = useCallback((nextPage: number) => {
    setTaskValues({ page: String(nextPage) });
  }, [setTaskValues]);

  const setHistoryPage = useCallback((nextPage: number) => {
    setHistoryValues({ page: String(nextPage) });
  }, [setHistoryValues]);

  const setAttendancePage = useCallback((nextPage: number) => {
    setAttendanceValues({ page: String(nextPage) });
  }, [setAttendanceValues]);

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
          <span className="text-[10px] text-text-secondary">
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
      header: "Rate",
      align: "right",
      cell: (item) => (
        <span className="text-right font-bold text-primary">
          {formatPKR(item.employeeRate)}
        </span>
      ),
    },
    {
      header: "",
      align: "right",
      cell: (item) => (
        <Button
          variant="tableIcon"
          size="iconSm"
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
        <span className="text-xs font-medium text-success">
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
        <span className="text-xs font-medium text-error">
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
          <Label variant="dashboard" className="font-mono">
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
          <SelectTrigger className="h-7 w-[130px] text-[10px] font-bold uppercase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
              <SelectItem
                key={key}
                value={key}
                className="text-[10px] font-bold uppercase"
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
              task.designType?.defaultRate,
            ),
          )}
        </span>
      ),
    },
    {
      header: "Last Update",
      align: "right",
      cell: (task) => (
        <span className="text-[10px] text-text-secondary">
          {formatDateTime(task.updatedAt)}
        </span>
      ),
    },
  ];

  const ledgerColumns: ColumnDef<EmployeeLedgerEntry>[] = [
    {
      header: "Date",
      cell: (entry) => (
        <span className="whitespace-nowrap text-xs text-text-secondary">
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
          className={`text-sm font-bold ${entry.amount >= 0 ? "text-ready" : "text-error"}`}
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
            <span className="text-[10px] text-text-secondary">
              {entry.note}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      header: "Order #",
      cell: (entry) => (
        <span className="text-xs text-text-secondary">
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
            variant="tableDanger"
            size="iconSm"
            className="h-7 w-7"
            onClick={() => onDeleteLedgerEntry(entry.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];

  const quickLinks = useMemo(
    () => [
      ...(systemSettings?.useTaskWorkflow
        ? [{ id: "employee-production", label: "Production Tasks" }]
        : []),
      { id: "employee-history", label: "Work History" },
      { id: "employee-ledger", label: "Ledger" },
      { id: "employee-attendance", label: "Attendance" },
      { id: "employee-documents", label: "Documents" },
      { id: "employee-account", label: "Account" },
    ],
    [systemSettings?.useTaskWorkflow],
  );

  return (
    <div className="space-y-6">
      <Card variant="elevatedPanel">
        <CardContent
          spacing="section"
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <Label variant="microCaps">Workspace Sections</Label>
            <Typography as="p" variant="muted">
              Jump between work logs, ledger, attendance, documents, and account
              controls.
            </Typography>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {quickLinks.map((link) => (
              <Button key={link.id} variant="muted" size="xs" asChild>
                <a href={`#${link.id}`}>{link.label}</a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {systemSettings?.useTaskWorkflow ? (
        <EmployeeSection
          id="employee-production"
          title="Production Tasks"
          description="Update assigned task statuses for this employee."
          badge={
            <Badge variant="secondary" size="xs" className="font-semibold">
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
          <Badge variant="secondary" size="xs" className="font-semibold">
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
          <Badge variant="secondary" size="xs" className="font-semibold">
            {ledgerTotal} ENTRIES
          </Badge>
        }
        action={
          canManageLedger ? (
            <Button
              size="sm"
              variant="premium"
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
              variant="table"
              className="h-8 w-full px-2 text-xs md:w-36"
              value={ledgerFrom}
              onChange={(event) => setLedgerFrom(event.target.value)}
            />
            <Input
              type="date"
              variant="table"
              className="h-8 w-full px-2 text-xs md:w-36"
              value={ledgerTo}
              onChange={(event) => setLedgerTo(event.target.value)}
            />
            <Select value={ledgerType} onValueChange={setLedgerType}>
              <SelectTrigger
                variant="table"
                className="h-8 w-full text-xs md:w-[140px]"
              >
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
          <Badge variant="secondary" size="xs" className="font-semibold">
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
          <Badge variant="secondary" size="xs" className="font-semibold">
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
              tone="surface"
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
                  <p className="text-[10px] font-bold uppercase tracking-tight text-text-secondary">
                    {document.fileType}
                  </p>
                </div>
              </div>
              <Button variant="tableIcon" size="iconSm" asChild>
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
              className="col-span-1 flex flex-col items-center justify-center py-14 text-text-secondary sm:col-span-2"
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
            <Card variant="successSoft">
              <CardHeader variant="sectionSoft" density="compact">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-5 w-5 text-success" /> System Access
                  Enabled
                </CardTitle>
                <CardDescription>
                  This employee has an active portal account.
                </CardDescription>
              </CardHeader>
              <CardContent spacing="section" className="space-y-4">
                <div className="flex items-center justify-between border-b border-divider py-2 text-sm">
                  <span className="text-text-secondary">Login Email</span>
                  <span className="font-bold tracking-tight">
                    {employee.userAccount.email}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-divider py-2 text-sm">
                  <span className="text-text-secondary">Status</span>
                  <Badge variant="outline">
                    {employee.userAccount.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-5 py-10 text-center">
              <InfoTile
                tone="elevated"
                padding="none"
                className="rounded-full border-none p-4"
              >
                <ShieldCheck className="h-10 w-10 text-text-secondary opacity-30" />
              </InfoTile>
              <div>
                <Typography as="h3" variant="sectionTitle">
                  No Portal Account
                </Typography>
                <p className="mt-1 max-w-[300px] text-sm text-text-secondary">
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
