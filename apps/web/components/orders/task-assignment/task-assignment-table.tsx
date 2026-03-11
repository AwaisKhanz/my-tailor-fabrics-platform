import { type Employee, type OrderItemTask, TaskStatus } from "@tbms/shared-types";
import { DataTable } from "@tbms/ui/components/data-table";
import { TableSurface } from "@tbms/ui/components/table-layout";
import { useTaskAssignmentTable } from "@/hooks/use-task-assignment-table";

interface TaskAssignmentTableProps {
  tasks: OrderItemTask[];
  employees: Array<Pick<Employee, "id" | "fullName">>;
  eligibleEmployeesByTask: Record<
    string,
    Array<Pick<Employee, "id" | "fullName">>
  >;
  loadingId: string | null;
  editingRateId: string | null;
  tempRate: string;
  rateValidationError: string;
  onTempRateChange: (value: string) => void;
  onAssign: (taskId: string, employeeId: string | null) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onStartRateEdit: (taskId: string, currentRateInRupees: number) => void;
  onCancelRateEdit: () => void;
  onRateUpdate: (taskId: string) => void;
}

export function TaskAssignmentTable({
  tasks,
  employees,
  eligibleEmployeesByTask,
  loadingId,
  editingRateId,
  tempRate,
  rateValidationError,
  onTempRateChange,
  onAssign,
  onStatusChange,
  onStartRateEdit,
  onCancelRateEdit,
  onRateUpdate,
}: TaskAssignmentTableProps) {
  const { columns, pagedTasks, page, pageSize, total, setPage } =
    useTaskAssignmentTable({
      tasks,
      employees,
      eligibleEmployeesByTask,
      loadingId,
      editingRateId,
      tempRate,
      rateValidationError,
      onTempRateChange,
      onAssign,
      onStatusChange,
      onStartRateEdit,
      onCancelRateEdit,
      onRateUpdate,
    });

  return (
    <TableSurface shadow="none">
      <DataTable
        columns={columns}
        data={pagedTasks}
        loading={false}
        itemLabel="tasks"
        emptyMessage="No tasks found. Was the workflow enabled when this order was placed?"
        chrome="flat"
        page={page}
        total={total}
        limit={pageSize}
        onPageChange={setPage}
      />
    </TableSurface>
  );
}
