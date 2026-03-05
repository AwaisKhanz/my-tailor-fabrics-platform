"use client";

import { useCallback, useMemo, useState } from "react";
import {
  taskRateOverrideFormSchema,
  type OrderItem,
  type TaskStatus,
} from "@tbms/shared-types";
import { ordersApi } from "@/lib/api/orders";
import { useToast } from "@/hooks/use-toast";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

export function useTaskAssignmentDialog(orderItem: OrderItem | null, onSuccess: () => void) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState("");

  const tasks = useMemo(
    () => [...(orderItem?.tasks || [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [orderItem?.tasks],
  );

  const handleAssign = useCallback(
    async (taskId: string, employeeId: string) => {
      setLoadingId(taskId);
      try {
        await ordersApi.assignTask(taskId, employeeId);
        toast({
          title: "Task Assigned",
          description: "The employee has been assigned to this step.",
        });
        onSuccess();
      } catch {
        toast({
          title: "Assignment Failed",
          description: "Could not assign task.",
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
      } catch {
        toast({
          title: "Update Failed",
          description: "Could not change task status.",
          variant: "destructive",
        });
      } finally {
        setLoadingId(null);
      }
    },
    [onSuccess, toast],
  );

  const startRateEdit = useCallback((taskId: string, currentRateInRupees: number) => {
    setEditingRateId(taskId);
    setTempRate(currentRateInRupees.toString());
  }, []);

  const cancelRateEdit = useCallback(() => {
    setEditingRateId(null);
  }, []);

  const updateTaskRate = useCallback(
    async (taskId: string) => {
      const parsedResult = taskRateOverrideFormSchema.safeParse({
        amount: tempRate,
      });
      if (!parsedResult.success) {
        toast({
          title: "Validation error",
          description: getFirstZodErrorMessage(parsedResult.error),
          variant: "destructive",
        });
        return;
      }
      const paisas = Math.round(parsedResult.data.amount * 100);

      setLoadingId(taskId);
      try {
        await ordersApi.updateTaskRate(taskId, paisas);
        toast({
          title: "Rate Updated",
          description: "The task rate has been overridden.",
        });
        setEditingRateId(null);
        onSuccess();
      } catch {
        toast({
          title: "Update Failed",
          description: "Could not update task rate.",
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
    loadingId,
    editingRateId,
    tempRate,
    setTempRate,
    handleAssign,
    handleStatusChange,
    startRateEdit,
    cancelRateEdit,
    updateTaskRate,
  };
}
