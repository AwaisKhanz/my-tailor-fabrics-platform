"use client";

import { useCallback, useMemo, useState } from "react";
import {
  type Employee,
  type OrderItem,
  type TaskStatus,
} from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import {
  useAssignOrderItemTask,
  useOrderTaskEligibleMap,
  useUpdateOrderTaskStatus,
} from "@/hooks/queries/order-queries";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";

export function useTaskAssignmentDialog(
  orderItem: OrderItem | null,
  employees: Array<Pick<Employee, "id" | "fullName">>,
  onSuccess: () => Promise<void> | void,
) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const assignOrderItemTaskMutation = useAssignOrderItemTask();
  const updateOrderTaskStatusMutation = useUpdateOrderTaskStatus();

  const tasks = useMemo(
    () =>
      [...(orderItem?.tasks || [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [orderItem?.tasks],
  );
  const taskEligibleQueries = useOrderTaskEligibleMap(
    tasks.map((task) => task.id),
  );
  const eligibleEmployeesByTask = useMemo<
    Record<string, Array<Pick<Employee, "id" | "fullName">>>
  >(() => {
    return tasks.reduce<
      Record<string, Array<Pick<Employee, "id" | "fullName">>>
    >((acc, task, index) => {
      const result = taskEligibleQueries[index]?.data;
      if (!result?.success) {
        acc[task.id] = [];
        return acc;
      }

      acc[task.id] = result.data.map((entry) => ({
        id: entry.employee.id,
        fullName: entry.employee.fullName,
      }));
      return acc;
    }, {});
  }, [taskEligibleQueries, tasks]);

  const handleAssign = useCallback(
    async (taskId: string, employeeId: string | null) => {
      setLoadingId(taskId);
      try {
        await assignOrderItemTaskMutation.mutateAsync({
          orderId: orderItem?.orderId || "",
          taskId,
          employeeId,
        });
        await onSuccess();
        toast({
          title: employeeId ? "Task Assigned" : "Task Unassigned",
          description: employeeId
            ? "The employee has been assigned to this step."
            : "The task has been moved back to unassigned.",
        });
      } catch (error: unknown) {
        toast({
          title: "Assignment Failed",
          description: getApiErrorMessageOrFallback(
            error,
            "Could not update task assignment.",
          ),
          variant: "destructive",
        });
      } finally {
        setLoadingId(null);
      }
    },
    [assignOrderItemTaskMutation, onSuccess, orderItem?.orderId, toast],
  );

  const handleStatusChange = useCallback(
    async (taskId: string, status: TaskStatus) => {
      setLoadingId(taskId);
      try {
        await updateOrderTaskStatusMutation.mutateAsync({
          orderId: orderItem?.orderId || "",
          taskId,
          status,
        });
        await onSuccess();
        toast({
          title: "Status Updated",
          description: "The task status was successfully changed.",
        });
      } catch (error: unknown) {
        toast({
          title: "Update Failed",
          description: getApiErrorMessageOrFallback(
            error,
            "Could not change task status.",
          ),
          variant: "destructive",
        });
      } finally {
        setLoadingId(null);
      }
    },
    [onSuccess, orderItem?.orderId, toast, updateOrderTaskStatusMutation],
  );

  return {
    tasks,
    eligibleEmployeesByTask,
    loadingId,
    handleAssign,
    handleStatusChange,
  };
}
