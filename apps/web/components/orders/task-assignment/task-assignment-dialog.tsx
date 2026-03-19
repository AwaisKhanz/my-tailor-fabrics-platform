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
  onSuccess: () => Promise<void> | void;
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
    handleAssign,
    handleStatusChange,
  } = useTaskAssignmentDialog(orderItem, employees, onSuccess);

  if (!orderItem) {
    return null;
  }

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Production Tasks: ${orderItem.garmentTypeName} (Piece #${orderItem.pieceNo})`}
      description="Complete this piece step by step. Later steps unlock only after the previous production step is finished."
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
        onAssign={handleAssign}
        onStatusChange={handleStatusChange}
      />
    </ScrollableDialog>
  );
}
