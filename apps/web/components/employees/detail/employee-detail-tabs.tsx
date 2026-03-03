"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  TaskStatus,
} from "@tbms/shared-types";
import {
  LEDGER_ENTRY_TYPE_BADGE,
  LEDGER_ENTRY_TYPE_LABELS,
  TASK_STATUS_LABELS,
  getEffectiveTaskRate,
} from "@tbms/shared-constants";
import type { EmployeeWithRelations } from "@/lib/api/employees";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { cn, formatDate, formatDateTime, formatPKR } from "@/lib/utils";

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
    <Card id={id} className="overflow-hidden border-border/70 bg-card/95">
      <CardHeader variant="rowSection" className="items-start gap-4 sm:items-center">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
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
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
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
}: EmployeeDetailTabsProps) {
  const historyColumns: ColumnDef<OrderItem>[] = [
    {
      header: "Order #",
      cell: (item) => <span className="font-bold">{item.order?.orderNumber || "-"}</span>,
    },
    {
      header: "Garment",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.garmentTypeName}</span>
          <span className="text-[10px] text-muted-foreground">
            {item.completedAt ? `Completed: ${formatDate(item.completedAt)}` : "Pending"}
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
        <span className="text-right font-bold text-primary">{formatPKR(item.employeeRate)}</span>
      ),
    },
    {
      header: "",
      align: "right",
      cell: (item) => (
        <Button variant="tableIcon" size="iconSm" onClick={() => onViewOrder(item.orderId)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const attendanceColumns: ColumnDef<AttendanceRecord>[] = [
    {
      header: "Date",
      cell: (record) => <span className="font-medium">{formatDate(record.date)}</span>,
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
      cell: (record) => <span className="font-bold">{record.hoursWorked?.toFixed(1) || "0.0"}h</span>,
    },
  ];

  const taskColumns: ColumnDef<OrderItemTask>[] = [
    {
      header: "Order #",
      cell: (task) => <span className="font-bold">{task.item?.order.orderNumber || "-"}</span>,
    },
    {
      header: "Item/Step",
      cell: (task) => (
        <div className="flex flex-col">
          <span className="font-medium">{task.item?.garmentTypeName || "-"}</span>
          <Label variant="dashboard" className="font-mono">
            {task.stepName}
          </Label>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (task) => (
        <Select value={task.status} onValueChange={(value) => onTaskStatusChange(task.id, value as TaskStatus)}>
          <SelectTrigger className="h-7 w-[130px] text-[10px] font-bold uppercase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-[10px] font-bold uppercase">
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
          {formatPKR(getEffectiveTaskRate(task.rateSnapshot, task.rateOverride, task.designType?.defaultRate))}
        </span>
      ),
    },
    {
      header: "Last Update",
      align: "right",
      cell: (task) => (
        <span className="text-[10px] text-muted-foreground">{formatDateTime(task.updatedAt)}</span>
      ),
    },
  ];

  const ledgerColumns: ColumnDef<EmployeeLedgerEntry>[] = [
    {
      header: "Date",
      cell: (entry) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(entry.createdAt as string)}
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
        <span className={`text-sm font-bold ${entry.amount >= 0 ? "text-ready" : "text-destructive"}`}>
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
              {entry.orderItemTask.stepName} - {entry.orderItemTask.orderItem?.garmentTypeName}
            </span>
          ) : null}
          {entry.note ? <span className="text-[10px] text-muted-foreground">{entry.note}</span> : null}
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
      cell: (entry) => (
        <Button
          variant="tableDanger"
          size="iconSm"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onDeleteLedgerEntry(entry.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
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
      <Card className="border-border/70 bg-card/95">
        <CardContent spacing="section" className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Workspace Sections
            </Label>
            <Typography as="p" variant="muted">
              Jump between work logs, ledger, attendance, documents, and account controls.
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
            data={tasks}
            loading={loading}
            emptyMessage="No assigned tasks found."
            chrome="flat"
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
          data={items}
          loading={loading}
          emptyMessage="No work items found."
          chrome="flat"
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
          <Button size="sm" variant="premium" className="h-8 w-full sm:w-auto" onClick={onOpenLedgerDialog}>
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
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
              <SelectTrigger variant="table" className="h-8 w-full text-xs md:w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(LEDGER_ENTRY_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="h-8 w-full md:w-auto" onClick={() => onFetchLedger(1)}>
              Filter
            </Button>
          </div>

          <DataTable<EmployeeLedgerEntry>
            columns={ledgerColumns}
            data={ledgerEntries}
            loading={ledgerLoading}
            emptyMessage="No ledger entries found."
            chrome="flat"
          />

          {ledgerTotal > ledgerLimit ? (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Showing {(ledgerPage - 1) * ledgerLimit + 1}-
                {Math.min(ledgerPage * ledgerLimit, ledgerTotal)} of {ledgerTotal}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={ledgerPage <= 1}
                  onClick={() => onFetchLedger(ledgerPage - 1)}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={ledgerPage * ledgerLimit >= ledgerTotal}
                  onClick={() => onFetchLedger(ledgerPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
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
          data={attendance}
          loading={loading}
          emptyMessage="No attendance records found."
          chrome="flat"
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
          <Button size="sm" variant="outline" className="h-8 w-full sm:w-auto" onClick={onOpenDocumentDialog}>
            <Plus className="h-4 w-4" />
            Add Document
          </Button>
        }
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
          {employee.documents?.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/50"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">{document.label}</p>
                  <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                    {document.fileType}
                  </p>
                </div>
              </div>
              <Button variant="tableIcon" size="iconSm" asChild>
                <a href={document.fileUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}

          {!employee.documents || employee.documents.length === 0 ? (
            <div className="col-span-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/50 py-14 text-muted-foreground sm:col-span-2">
              <FileText className="mb-3 h-12 w-12 opacity-20" />
              <p className="text-sm font-medium">No documentation uploaded yet.</p>
            </div>
          ) : null}
        </div>
      </EmployeeSection>

      <EmployeeSection
        id="employee-account"
        title="Portal Account"
        description="Provision and review employee login access to the system."
        badge={
          <Badge variant={employee.userAccount ? "success" : "outline"} size="xs" className="font-semibold">
            {employee.userAccount ? "ACTIVE" : "NOT PROVISIONED"}
          </Badge>
        }
        defaultOpen={false}
      >
        <div className="p-4 sm:p-5">
          {employee.userAccount ? (
            <Card className="border-success/20 bg-success/10 shadow-none">
              <CardHeader variant="sectionSoft" density="compact">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-5 w-5 text-success" /> System Access Enabled
                </CardTitle>
                <CardDescription>This employee has an active portal account.</CardDescription>
              </CardHeader>
              <CardContent spacing="section" className="space-y-4">
                <div className="flex items-center justify-between border-b py-2 text-sm">
                  <span className="text-muted-foreground">Login Email</span>
                  <span className="font-bold tracking-tight">{employee.userAccount.email}</span>
                </div>
                <div className="flex items-center justify-between border-b py-2 text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline">{employee.userAccount.isActive ? "ACTIVE" : "INACTIVE"}</Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-5 py-10 text-center">
              <div className="rounded-full bg-muted p-4">
                <ShieldCheck className="h-10 w-10 text-muted-foreground opacity-30" />
              </div>
              <div>
                <Typography as="h3" variant="sectionTitle">
                  No Portal Account
                </Typography>
                <p className="mt-1 max-w-[300px] text-sm text-muted-foreground">
                  Provision an account to allow order tracking access.
                </p>
              </div>
              <Button size="lg" className="rounded-full px-8" onClick={onOpenAccountDialog}>
                Provision Account Now
              </Button>
            </div>
          )}
        </div>
      </EmployeeSection>
    </div>
  );
}
