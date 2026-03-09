"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { attendanceApi } from "@/lib/api/attendance";
import { configApi } from "@/lib/api/config";
import { employeesApi, type EmployeeWithRelations } from "@/lib/api/employees";
import { ordersApi } from "@/lib/api/orders";
import type {
  AttendanceRecord,
  EmployeeCapability,
  EmployeeCompensationHistoryEntry,
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

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<EmployeeWithRelations | null>(null);
  const [stats, setStats] = useState<EmployeeStatsSnapshot>({
    totalEarned: 0,
    totalPaid: 0,
    currentBalance: 0,
  });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [tasks, setTasks] = useState<OrderItemTask[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [capabilities, setCapabilities] = useState<EmployeeCapability[]>([]);
  const [compensationHistory, setCompensationHistory] = useState<
    EmployeeCompensationHistoryEntry[]
  >([]);

  const fetchEmployeeData = useCallback(async () => {
    if (!employeeId) {
      return;
    }

    setLoading(true);
    try {
      const [
        employeeResponse,
        statsResponse,
        itemsResponse,
        attendanceResponse,
        tasksResponse,
        settingsResponse,
        garmentTypesResponse,
        capabilitiesResponse,
        compensationResponse,
      ] = await Promise.all([
        employeesApi.getEmployee(employeeId),
        employeesApi.getStats(employeeId),
        employeesApi.getItems(employeeId),
        attendanceApi.getAttendance({ employeeId, limit: 10 }),
        ordersApi.getTasksByEmployee(employeeId),
        configApi.getSystemSettings(),
        configApi.getGarmentTypes(),
        employeesApi.getCapabilities(employeeId),
        employeesApi.getCompensationHistory(employeeId),
      ]);

      if (employeeResponse.success) {
        setEmployee(employeeResponse.data);
      }
      if (statsResponse.success) {
        setStats({
          totalEarned: statsResponse.data.totalEarned ?? 0,
          totalPaid: statsResponse.data.totalPaid ?? 0,
          currentBalance:
            statsResponse.data.currentBalance ?? statsResponse.data.balance ?? 0,
        });
      }
      if (itemsResponse.success) {
        setItems(itemsResponse.data.data);
      }
      if (attendanceResponse.success) {
        setAttendance(attendanceResponse.data.data);
      }
      if (tasksResponse.success) {
        setTasks(tasksResponse.data);
      }
      if (settingsResponse.success) {
        setSystemSettings(settingsResponse.data);
      }
      if (garmentTypesResponse.success) {
        setGarmentTypes(garmentTypesResponse.data.data);
      }
      if (capabilitiesResponse.success) {
        setCapabilities(capabilitiesResponse.data);
      }
      if (compensationResponse.success) {
        setCompensationHistory(compensationResponse.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Employee data could not be loaded",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [employeeId, toast]);

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
