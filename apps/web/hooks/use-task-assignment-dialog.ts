"use client";

import { useCallback, useMemo, useState } from "react";
import {
  type Employee,
  taskRateOverrideFormSchema,
  type OrderItem,
  type TaskStatus,
} from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import {
  useAssignOrderItemTask,
  useOrderTaskEligibleMap,
  useUpdateOrderTaskRate,
  useUpdateOrderTaskStatus,
} from "@/hooks/queries/order-queries";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";

export function useTaskAssignmentDialog(
  orderItem: OrderItem | null,
  employees: Array<Pick<Employee, "id" | "fullName">>,
  onSuccess: () => void,
) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState("");
  const [rateValidationError, setRateValidationError] = useState("");
  const assignOrderItemTaskMutation = useAssignOrderItemTask();
  const updateOrderTaskStatusMutation = useUpdateOrderTaskStatus();
  const updateOrderTaskRateMutation = useUpdateOrderTaskRate();

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
        toast({
          title: employeeId ? "Task Assigned" : "Task Unassigned",
          description: employeeId
            ? "The employee has been assigned to this step."
            : "The task has been moved back to unassigned.",
        });
        onSuccess();
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
        toast({
          title: "Status Updated",
          description: "The task status was successfully changed.",
        });
        onSuccess();
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

  const startRateEdit = useCallback(
    (taskId: string, currentRateInRupees: number) => {
      setRateValidationError("");
      setEditingRateId(taskId);
      setTempRate(currentRateInRupees.toString());
    },
    [],
  );

  const cancelRateEdit = useCallback(() => {
    setRateValidationError("");
    setEditingRateId(null);
  }, []);

  const updateTaskRate = useCallback(
    async (taskId: string) => {
      const parsedResult = taskRateOverrideFormSchema.safeParse({
        amount: tempRate,
      });
      if (!parsedResult.success) {
        setRateValidationError(
          parsedResult.error.flatten().fieldErrors.amount?.[0] ??
            "Enter a valid labor rate.",
        );
        return;
      }
      setRateValidationError("");
      setLoadingId(taskId);
      try {
        await updateOrderTaskRateMutation.mutateAsync({
          orderId: orderItem?.orderId || "",
          taskId,
          rate: parsedResult.data.amount,
        });
        toast({
          title: "Rate Updated",
          description: "The task rate has been overridden.",
        });
        setEditingRateId(null);
        onSuccess();
      } catch (error: unknown) {
        toast({
          title: "Update Failed",
          description: getApiErrorMessageOrFallback(
            error,
            "Could not update task rate.",
          ),
          variant: "destructive",
        });
      } finally {
        setLoadingId(null);
      }
    },
    [
      onSuccess,
      orderItem?.orderId,
      tempRate,
      toast,
      updateOrderTaskRateMutation,
    ],
  );

  return {
    tasks,
    eligibleEmployeesByTask,
    loadingId,
    editingRateId,
    tempRate,
    rateValidationError,
    setTempRate: (value: string) => {
      setRateValidationError("");
      setTempRate(value);
    },
    handleAssign,
    handleStatusChange,
    startRateEdit,
    cancelRateEdit,
    updateTaskRate,
  };
}
