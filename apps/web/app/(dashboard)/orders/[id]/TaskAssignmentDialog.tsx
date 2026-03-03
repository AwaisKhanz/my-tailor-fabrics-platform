"use client";

import { type Employee, type OrderItem } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { TaskAssignmentTable } from "@/components/orders/task-assignment/task-assignment-table";
import { useTaskAssignmentDialog } from "@/hooks/use-task-assignment-dialog";

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
    loadingId,
    editingRateId,
    tempRate,
    setTempRate,
    handleAssign,
    handleStatusChange,
    startRateEdit,
    cancelRateEdit,
    updateTaskRate,
  } = useTaskAssignmentDialog(orderItem, onSuccess);

  if (!orderItem) {
    return null;
  }

  const footerActions = (
    <div className="flex w-full justify-end gap-2">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Close
      </Button>
    </div>
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Production Tasks: ${orderItem.garmentTypeName} (Piece #${orderItem.pieceNo})`}
      description="Manage production steps for this specific piece. Assignments and statuses are tracked independently per piece."
      footerActions={footerActions}
      maxWidthClass="sm:max-w-[850px]"
      maxHeightClass="max-h-[90vh]"
    >
      <TaskAssignmentTable
        tasks={tasks}
        employees={employees}
        loadingId={loadingId}
        editingRateId={editingRateId}
        tempRate={tempRate}
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
