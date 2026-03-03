import { useMemo } from "react";
import { Check, Edit2, X } from "lucide-react";
import {
  type BadgeVariant,
  type Employee,
  type OrderItemTask,
  TaskStatus,
} from "@tbms/shared-types";
import { TASK_STATUS_LABELS, getEffectiveTaskRate } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSurface } from "@/components/ui/table-layout";
import { formatPKR } from "@/lib/utils";

interface TaskAssignmentTableProps {
  tasks: OrderItemTask[];
  employees: Array<Pick<Employee, "id" | "fullName">>;
  loadingId: string | null;
  editingRateId: string | null;
  tempRate: string;
  onTempRateChange: (value: string) => void;
  onAssign: (taskId: string, employeeId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onStartRateEdit: (taskId: string, currentRateInRupees: number) => void;
  onCancelRateEdit: () => void;
  onRateUpdate: (taskId: string) => void;
}

const STATUS_VARIANTS: Record<TaskStatus, BadgeVariant> = {
  [TaskStatus.PENDING]: "outline",
  [TaskStatus.IN_PROGRESS]: "default",
  [TaskStatus.DONE]: "success",
  [TaskStatus.CANCELLED]: "destructive",
};

export function TaskAssignmentTable({
  tasks,
  employees,
  loadingId,
  editingRateId,
  tempRate,
  onTempRateChange,
  onAssign,
  onStatusChange,
  onStartRateEdit,
  onCancelRateEdit,
  onRateUpdate,
}: TaskAssignmentTableProps) {
  const columns = useMemo<ColumnDef<OrderItemTask>[]>(
    () => [
      {
        header: "Step",
        cell: (task) => (
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{task.stepName}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {task.stepKey}
            </span>
          </div>
        ),
      },
      {
        header: "Assigned Employee",
        cell: (task) => (
          <div className="min-w-[180px]">
            <Select
              disabled={loadingId === task.id}
              value={task.assignedEmployeeId || "unassigned"}
              onValueChange={(value) => {
                if (value !== "unassigned") {
                  onAssign(task.id, value);
                }
              }}
            >
              <SelectTrigger variant="table" className="h-8 text-xs font-semibold">
                <SelectValue placeholder="Assign Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ),
      },
      {
        header: "Status",
        cell: (task) => (
          <div className="min-w-[140px]">
            <Select
              disabled={loadingId === task.id}
              value={task.status}
              onValueChange={(value) => onStatusChange(task.id, value as TaskStatus)}
            >
              <SelectTrigger className="h-8 border-none bg-transparent p-0 shadow-none hover:bg-muted">
                <Badge variant={STATUS_VARIANTS[task.status] || "outline"} className="w-full justify-center uppercase">
                  {TASK_STATUS_LABELS[task.status]}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_STATUS_LABELS).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ),
      },
      {
        header: "Labor Rate",
        align: "right",
        cell: (task) => {
          const effectiveRateInRupees =
            getEffectiveTaskRate(task.rateSnapshot, task.rateOverride, task.designType?.defaultRate) / 100;
          const isEditing = editingRateId === task.id;

          if (isEditing) {
            return (
              <div className="flex items-center justify-end gap-1">
                <Input
                  variant="table"
                  className="h-7 w-20 text-right text-xs"
                  type="number"
                  value={tempRate}
                  onChange={(event) => onTempRateChange(event.target.value)}
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onRateUpdate(task.id);
                    }
                    if (event.key === "Escape") {
                      onCancelRateEdit();
                    }
                  }}
                />
                <Button
                  variant="tableIcon"
                  size="iconSm"
                  className="h-7 w-7 text-success"
                  onClick={() => onRateUpdate(task.id)}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="tableDanger"
                  size="iconSm"
                  className="h-7 w-7 text-destructive"
                  onClick={onCancelRateEdit}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          }

          return (
            <div className="group flex items-center justify-end gap-2">
              <div className="flex flex-col items-end">
                <span
                  className={`text-sm font-bold ${
                    task.rateOverride
                      ? "text-primary"
                      : task.designType?.defaultRate
                        ? "text-primary/80"
                        : "text-foreground"
                  }`}
                >
                  {formatPKR(
                    getEffectiveTaskRate(task.rateSnapshot, task.rateOverride, task.designType?.defaultRate),
                  )}
                </span>
                {task.rateOverride ? (
                  <span className="text-[9px] text-muted-foreground line-through">
                    Base: {formatPKR(task.rateSnapshot ?? 0)}
                  </span>
                ) : null}
              </div>
              <Button
                variant="tableIcon"
                size="iconSm"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onStartRateEdit(task.id, effectiveRateInRupees)}
              >
                <Edit2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      editingRateId,
      employees,
      loadingId,
      onAssign,
      onCancelRateEdit,
      onRateUpdate,
      onStartRateEdit,
      onStatusChange,
      onTempRateChange,
      tempRate,
    ],
  );

  return (
    <TableSurface className="shadow-none">
      <DataTable
        columns={columns}
        data={tasks}
        loading={false}
        itemLabel="tasks"
        emptyMessage="No tasks found. Was the workflow enabled when this order was placed?"
        chrome="flat"
      />
    </TableSurface>
  );
}
