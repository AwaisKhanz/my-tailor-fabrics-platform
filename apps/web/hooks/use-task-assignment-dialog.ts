"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Employee,
  taskRateOverrideFormSchema,
  type OrderItem,
  type TaskStatus,
} from "@tbms/shared-types";
import { ordersApi } from "@/lib/api/orders";
import { useToast } from "@/hooks/use-toast";
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
  const [eligibleEmployeesByTask, setEligibleEmployeesByTask] = useState<
    Record<string, Array<Pick<Employee, "id" | "fullName">>>
  >({});

  const tasks = useMemo(
    () => [...(orderItem?.tasks || [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [orderItem?.tasks],
  );

  useEffect(() => {
    let ignore = false;

    async function loadEligibleEmployees() {
      if (tasks.length === 0) {
        setEligibleEmployeesByTask({});
        return;
      }

      const nextMap: Record<string, Array<Pick<Employee, "id" | "fullName">>> = {};
      await Promise.all(
        tasks.map(async (task) => {
          try {
            const response = await ordersApi.getEligibleEmployeesForTask(task.id);
            if (!response.success) {
              return;
            }
            nextMap[task.id] = response.data.map((entry) => ({
              id: entry.employee.id,
              fullName: entry.employee.fullName,
            }));
          } catch {
            nextMap[task.id] = [];
          }
        }),
      );

      if (!ignore) {
        setEligibleEmployeesByTask(nextMap);
      }
    }

    void loadEligibleEmployees();
    return () => {
      ignore = true;
    };
  }, [employees, tasks]);

  const handleAssign = useCallback(
    async (taskId: string, employeeId: string | null) => {
      setLoadingId(taskId);
      try {
        await ordersApi.assignTask(taskId, employeeId);
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
    [onSuccess, toast],
  );

  const handleStatusChange = useCallback(
    async (taskId: string, status: TaskStatus) => {
      setLoadingId(taskId);
      try {
        await ordersApi.updateTaskStatus(taskId, status);
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
    [onSuccess, toast],
  );

  const startRateEdit = useCallback((taskId: string, currentRateInRupees: number) => {
    setRateValidationError("");
    setEditingRateId(taskId);
    setTempRate(currentRateInRupees.toString());
  }, []);

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
        await ordersApi.updateTaskRate(taskId, parsedResult.data.amount);
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
    [onSuccess, tempRate, toast],
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
