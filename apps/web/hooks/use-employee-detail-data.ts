"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  useEmployee,
  useEmployeeCompensationHistory,
  useEmployeeItems,
  useEmployeeStats,
  useEmployeeCapabilities,
} from "@/hooks/queries/employee-queries";
import { useAttendanceList } from "@/hooks/queries/attendance-queries";
import {
  useGarmentTypesList,
  useSystemSettings,
} from "@/hooks/queries/config-queries";
import { useTasksByEmployee } from "@/hooks/queries/order-queries";
import type {
  AttendanceRecord,
  EmployeeCapability,
  EmployeeCompensationHistoryEntry,
  EmployeeWithRelations,
  GarmentType,
  OrderItem,
  OrderItemTask,
  SystemSettings,
} from "@tbms/shared-types";

interface EmployeeStatsSnapshot {
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
}

interface UseEmployeeDetailDataParams {
  employeeId: string | null;
}

export function useEmployeeDetailData({
  employeeId,
}: UseEmployeeDetailDataParams) {
  const { toast } = useToast();
  const employeeQuery = useEmployee(employeeId);
  const statsQuery = useEmployeeStats(employeeId);
  const itemsQuery = useEmployeeItems(employeeId);
  const attendanceQuery = useAttendanceList(
    employeeId ? { employeeId, limit: 10 } : { limit: 10 },
  );
  const tasksQuery = useTasksByEmployee(employeeId);
  const systemSettingsQuery = useSystemSettings();
  const garmentTypesQuery = useGarmentTypesList();
  const capabilitiesQuery = useEmployeeCapabilities(employeeId);
  const compensationQuery = useEmployeeCompensationHistory(employeeId);

  const [capabilities, setCapabilities] = useState<EmployeeCapability[]>([]);

  useEffect(() => {
    if (capabilitiesQuery.data?.success) {
      setCapabilities(capabilitiesQuery.data.data);
    }
  }, [capabilitiesQuery.data]);

  const loading =
    employeeQuery.isLoading ||
    statsQuery.isLoading ||
    itemsQuery.isLoading ||
    attendanceQuery.isLoading ||
    tasksQuery.isLoading ||
    systemSettingsQuery.isLoading ||
    garmentTypesQuery.isLoading ||
    capabilitiesQuery.isLoading ||
    compensationQuery.isLoading;

  const employee: EmployeeWithRelations | null = employeeQuery.data?.success
    ? employeeQuery.data.data
    : null;
  const stats: EmployeeStatsSnapshot = statsQuery.data?.success
    ? {
        totalEarned: statsQuery.data.data.totalEarned ?? 0,
        totalPaid: statsQuery.data.data.totalPaid ?? 0,
        currentBalance:
          statsQuery.data.data.currentBalance ??
          statsQuery.data.data.balance ??
          0,
      }
    : {
        totalEarned: 0,
        totalPaid: 0,
        currentBalance: 0,
      };
  const items: OrderItem[] = itemsQuery.data?.success
    ? itemsQuery.data.data.data
    : [];
  const tasks: OrderItemTask[] = tasksQuery.data?.success
    ? tasksQuery.data.data
    : [];
  const attendance: AttendanceRecord[] = attendanceQuery.data?.success
    ? attendanceQuery.data.data.data
    : [];
  const systemSettings: SystemSettings | null = systemSettingsQuery.data
    ?.success
    ? systemSettingsQuery.data.data
    : null;
  const garmentTypes: GarmentType[] = garmentTypesQuery.data?.success
    ? garmentTypesQuery.data.data.data
    : [];
  const compensationHistory: EmployeeCompensationHistoryEntry[] =
    compensationQuery.data?.success ? compensationQuery.data.data : [];

  const fetchEmployeeData = useCallback(async () => {
    if (!employeeId) {
      return;
    }
    try {
      await Promise.all([
        employeeQuery.refetch(),
        statsQuery.refetch(),
        itemsQuery.refetch(),
        attendanceQuery.refetch(),
        tasksQuery.refetch(),
        systemSettingsQuery.refetch(),
        garmentTypesQuery.refetch(),
        capabilitiesQuery.refetch(),
        compensationQuery.refetch(),
      ]);
    } catch {
      toast({
        title: "Error",
        description: "Employee data could not be loaded",
        variant: "destructive",
      });
    }
  }, [
    attendanceQuery,
    capabilitiesQuery,
    compensationQuery,
    employeeId,
    employeeQuery,
    garmentTypesQuery,
    itemsQuery,
    statsQuery,
    systemSettingsQuery,
    tasksQuery,
    toast,
  ]);

  return {
    loading,
    employee,
    stats,
    items,
    tasks,
    attendance,
    systemSettings,
    garmentTypes,
    capabilities,
    compensationHistory,
    setCapabilities,
    fetchEmployeeData,
  };
}
