"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { employeesApi, type EmployeeWithRelations } from "@/lib/api/employees";
import { attendanceApi } from "@/lib/api/attendance";
import { ordersApi } from "@/lib/api/orders";
import { configApi } from "@/lib/api/config";
import { useEmployeeDocumentManager } from "@/hooks/use-employee-document-manager";
import { useEmployeeLedgerManager } from "@/hooks/use-employee-ledger-manager";
import {
  employeeCapabilitySnapshotFormSchema,
  employeeCompensationChangeFormSchema,
  type AttendanceRecord,
  type EmployeeCapability,
  type EmployeeCompensationHistoryEntry,
  type EmployeeCapabilitySnapshot,
  type CompensationChangeInput,
  type GarmentType,
  PaymentType,
  type OrderItem,
  type OrderItemTask,
  type SystemSettings,
  type TaskStatus,
} from "@tbms/shared-types";

interface EmployeeStatsSnapshot {
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
}

interface UseEmployeeDetailPageParams {
  employeeId: string | null;
}

export function useEmployeeDetailPage({ employeeId }: UseEmployeeDetailPageParams) {
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

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

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
      ] =
        await Promise.all([
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
          currentBalance: statsResponse.data.currentBalance ?? statsResponse.data.balance ?? 0,
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

  const {
    docLabel,
    setDocLabel,
    docUrl,
    setDocUrl,
    documentFieldErrors,
    documentValidationError,
    uploadingDocument,
    uploadDocument,
    clearDocumentForm,
  } = useEmployeeDocumentManager({
    employeeId,
    fetchEmployeeData,
    toast,
  });

  const {
    ledgerEntries,
    ledgerLoading,
    ledgerFrom,
    ledgerTo,
    ledgerType,
    ledgerTypeFilterOptions,
    ledgerPage,
    ledgerTotal,
    ledgerLimit,
    setLedgerFrom,
    setLedgerTo,
    setLedgerType,
    fetchLedger,
    ledgerDialogOpen,
    setLedgerDialogOpen,
    newEntryType,
    setNewEntryType,
    newEntryAmount,
    setNewEntryAmount,
    newEntryNote,
    setNewEntryNote,
    ledgerEntryFieldErrors,
    ledgerEntryValidationError,
    submittingLedgerEntry,
    ledgerEntryToReverseId,
    submitLedgerEntry,
    requestLedgerEntryReverse,
    closeLedgerEntryReverseDialog,
    confirmLedgerEntryReverse,
  } = useEmployeeLedgerManager({
    employeeId,
    fetchEmployeeData,
    toast,
  });

  const handleTaskStatusChange = useCallback(
    async (taskId: string, status: TaskStatus) => {
      try {
        await ordersApi.updateTaskStatus(taskId, status);
        toast({ title: "Status Updated" });
        await fetchEmployeeData();
      } catch {
        toast({ title: "Update Failed", variant: "destructive" });
      }
    },
    [fetchEmployeeData, toast],
  );

  const saveCapabilitiesSnapshot = useCallback(
    async (snapshot: EmployeeCapabilitySnapshot) => {
      if (!employeeId) {
        return false;
      }

      const parsedResult = employeeCapabilitySnapshotFormSchema.safeParse(snapshot);
      if (!parsedResult.success) {
        return false;
      }

      try {
        const response = await employeesApi.replaceCapabilities(
          employeeId,
          parsedResult.data,
        );

        if (response.success) {
          setCapabilities(response.data);
          toast({ title: "Capabilities updated successfully" });
          await fetchEmployeeData();
          return true;
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to update capabilities",
          variant: "destructive",
        });
      }

      return false;
    },
    [employeeId, fetchEmployeeData, toast],
  );

  const scheduleCompensationChange = useCallback(
    async (change: CompensationChangeInput) => {
      if (!employeeId) {
        return false;
      }

      const parsedResult = employeeCompensationChangeFormSchema.safeParse(change);
      if (!parsedResult.success) {
        return false;
      }

      try {
        const payload: CompensationChangeInput = {
          paymentType: parsedResult.data.paymentType,
          monthlySalary:
            parsedResult.data.paymentType === PaymentType.MONTHLY_FIXED &&
            parsedResult.data.monthlySalary !== undefined
              ? parsedResult.data.monthlySalary
              : undefined,
          effectiveFrom: parsedResult.data.effectiveFrom,
          note: parsedResult.data.note ?? undefined,
        };

        const response = await employeesApi.createCompensationChange(
          employeeId,
          payload,
        );

        if (response.success) {
          toast({ title: "Compensation change scheduled" });
          await fetchEmployeeData();
          return true;
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to schedule compensation change",
          variant: "destructive",
        });
      }

      return false;
    },
    [employeeId, fetchEmployeeData, toast],
  );

  useEffect(() => {
    if (!employeeId) {
      return;
    }
    void fetchEmployeeData();
  }, [employeeId, fetchEmployeeData]);

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
    fetchEmployeeData,
    handleTaskStatusChange,
    saveCapabilitiesSnapshot,
    scheduleCompensationChange,

    ledgerEntries,
    ledgerLoading,
    ledgerFrom,
    ledgerTo,
    ledgerType,
    ledgerTypeFilterOptions,
    ledgerPage,
    ledgerTotal,
    ledgerLimit,
    setLedgerFrom,
    setLedgerTo,
    setLedgerType,
    fetchLedger,

    accountDialogOpen,
    setAccountDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    documentDialogOpen,
    setDocumentDialogOpen,
    ledgerDialogOpen,
    setLedgerDialogOpen,

    docLabel,
    setDocLabel,
    docUrl,
    setDocUrl,
    documentFieldErrors,
    documentValidationError,
    uploadingDocument,
    uploadDocument: async () => {
      const success = await uploadDocument();
      if (success) {
        setDocumentDialogOpen(false);
        clearDocumentForm();
      }
    },

    newEntryType,
    setNewEntryType,
    newEntryAmount,
    setNewEntryAmount,
    newEntryNote,
    setNewEntryNote,
    ledgerEntryFieldErrors,
    ledgerEntryValidationError,
    submittingLedgerEntry,
    ledgerEntryToReverseId,
    submitLedgerEntry,
    requestLedgerEntryReverse,
    closeLedgerEntryReverseDialog,
    confirmLedgerEntryReverse,
  };
}
