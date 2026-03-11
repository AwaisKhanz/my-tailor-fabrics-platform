"use client";

import { type Employee, type OrderItem } from "@tbms/shared-types";
import { Button } from "@tbms/ui/components/button";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { useTaskAssignmentDialog } from "@/hooks/use-task-assignment-dialog";
import { TaskAssignmentTable } from "@/components/orders/task-assignment/task-assignment-table";

interface TaskAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItem: OrderItem | null;
  employees: Array<Pick<Employee, "id" | "fullName">>;
  onSuccess: () => void;
}

export function TaskAssignmentDialog({
  open,
  onOpenChange,
  orderItem,
  employees,
  onSuccess,
}: TaskAssignmentDialogProps) {
  const {
    tasks,
    eligibleEmployeesByTask,
    loadingId,
    editingRateId,
    tempRate,
    rateValidationError,
    setTempRate,
    handleAssign,
    handleStatusChange,
    startRateEdit,
    cancelRateEdit,
    updateTaskRate,
  } = useTaskAssignmentDialog(orderItem, employees, onSuccess);

  if (!orderItem) {
    return null;
  }

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Production Tasks: ${orderItem.garmentTypeName} (Piece #${orderItem.pieceNo})`}
      description="Manage production steps for this specific piece. Assignments and statuses are tracked independently per piece."
      footerActions={
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      }
      maxWidthClass="sm:max-w-[850px]"
      maxHeightClass="max-h-[90vh]"
    >
      <TaskAssignmentTable
        tasks={tasks}
        employees={employees}
        eligibleEmployeesByTask={eligibleEmployeesByTask}
        loadingId={loadingId}
        editingRateId={editingRateId}
        tempRate={tempRate}
        rateValidationError={rateValidationError}
        onTempRateChange={setTempRate}
        onAssign={handleAssign}
        onStatusChange={handleStatusChange}
        onStartRateEdit={startRateEdit}
        onCancelRateEdit={cancelRateEdit}
        onRateUpdate={updateTaskRate}
      />
    </ScrollableDialog>
  );
}
