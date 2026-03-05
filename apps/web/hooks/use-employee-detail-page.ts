"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { employeesApi, type EmployeeWithRelations } from "@/lib/api/employees";
import { attendanceApi } from "@/lib/api/attendance";
import { ordersApi } from "@/lib/api/orders";
import { configApi } from "@/lib/api/config";
import { ledgerApi } from "@/lib/api/ledger";
import {
  employeeDocumentUploadFormSchema,
  employeeLedgerEntryFormSchema,
  type AttendanceRecord,
  LedgerEntryType,
  type EmployeeLedgerEntry,
  type OrderItem,
  type OrderItemTask,
  type SystemSettings,
  type TaskStatus,
} from "@tbms/shared-types";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

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

  const [ledgerEntries, setLedgerEntries] = useState<EmployeeLedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerFrom, setLedgerFrom] = useState("");
  const [ledgerTo, setLedgerTo] = useState("");
  const [ledgerType, setLedgerType] = useState<string>("all");
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const ledgerLimit = 20;

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);

  const [docLabel, setDocLabel] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const [newEntryType, setNewEntryType] = useState<LedgerEntryType>(
    LedgerEntryType.ADJUSTMENT,
  );
  const [newEntryAmount, setNewEntryAmount] = useState("");
  const [newEntryNote, setNewEntryNote] = useState("");
  const [submittingLedgerEntry, setSubmittingLedgerEntry] = useState(false);

  const fetchEmployeeData = useCallback(async () => {
    if (!employeeId) {
      return;
    }

    setLoading(true);
    try {
      const [employeeResponse, statsResponse, itemsResponse, attendanceResponse, tasksResponse, settingsResponse] =
        await Promise.all([
          employeesApi.getEmployee(employeeId),
          employeesApi.getStats(employeeId),
          employeesApi.getItems(employeeId),
          attendanceApi.getAttendance({ employeeId, limit: 10 }),
          ordersApi.getTasksByEmployee(employeeId),
          configApi.getSystemSettings(),
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

  const fetchLedger = useCallback(
    async (page = 1) => {
      if (!employeeId) {
        return;
      }

      setLedgerLoading(true);
      try {
        const response = await ledgerApi.getStatement(employeeId, {
          from: ledgerFrom || undefined,
          to: ledgerTo || undefined,
          type: ledgerType === "all" ? undefined : (ledgerType as LedgerEntryType),
          page,
          limit: ledgerLimit,
        });

        if (response.success) {
          setLedgerEntries(response.data.entries);
          setLedgerTotal(response.data.meta.total);
          setLedgerPage(page);
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to load ledger",
          variant: "destructive",
        });
      } finally {
        setLedgerLoading(false);
      }
    },
    [employeeId, ledgerFrom, ledgerTo, ledgerType, toast],
  );

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

  const submitLedgerEntry = useCallback(async () => {
    if (!employeeId) {
      return;
    }

    const parsedResult = employeeLedgerEntryFormSchema.safeParse({
      type: newEntryType,
      amount: newEntryAmount,
      note: newEntryNote,
    });

    if (!parsedResult.success) {
      toast({
        title: "Validation error",
        description: getFirstZodErrorMessage(parsedResult.error),
        variant: "destructive",
      });
      return;
    }

    setSubmittingLedgerEntry(true);
    try {
      const amountInPaisa = Math.round(parsedResult.data.amount * 100);
      const isNegativeType = [
        LedgerEntryType.PAYOUT,
        LedgerEntryType.ADVANCE,
        LedgerEntryType.DEDUCTION,
      ].includes(newEntryType);

      const finalAmount = isNegativeType
        ? -Math.abs(amountInPaisa)
        : Math.abs(amountInPaisa);

      const response = await ledgerApi.createEntry({
        employeeId,
        type: newEntryType,
        amount: finalAmount,
        note: parsedResult.data.note || undefined,
      });

      if (response.success) {
        toast({
          title: "Entry Recorded",
          description: "Ledger has been updated successfully.",
        });
        setLedgerDialogOpen(false);
        setNewEntryAmount("");
        setNewEntryNote("");
        await Promise.all([fetchLedger(1), fetchEmployeeData()]);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create ledger entry",
        variant: "destructive",
      });
    } finally {
      setSubmittingLedgerEntry(false);
    }
  }, [employeeId, fetchEmployeeData, fetchLedger, newEntryAmount, newEntryNote, newEntryType, toast]);

  const deleteLedgerEntry = useCallback(
    async (entryId: string) => {
      try {
        const response = await ledgerApi.deleteEntry(entryId);
        if (response.success) {
          toast({ title: "Entry Deleted" });
          await Promise.all([fetchLedger(ledgerPage), fetchEmployeeData()]);
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete entry",
          variant: "destructive",
        });
      }
    },
    [fetchEmployeeData, fetchLedger, ledgerPage, toast],
  );

  const uploadDocument = useCallback(async () => {
    if (!employeeId) {
      return;
    }

    const parsedResult = employeeDocumentUploadFormSchema.safeParse({
      label: docLabel,
      url: docUrl,
    });
    if (!parsedResult.success) {
      toast({
        title: "Validation error",
        description: getFirstZodErrorMessage(parsedResult.error),
        variant: "destructive",
      });
      return;
    }

    setUploadingDocument(true);
    try {
      await employeesApi.uploadDocument(employeeId, {
        label: parsedResult.data.label,
        fileUrl: parsedResult.data.url,
        fileType: parsedResult.data.url.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg",
      });
      toast({ title: "Document Uploaded" });
      setDocumentDialogOpen(false);
      setDocLabel("");
      setDocUrl("");
      await fetchEmployeeData();
    } catch {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setUploadingDocument(false);
    }
  }, [docLabel, docUrl, employeeId, fetchEmployeeData, toast]);

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
    fetchEmployeeData,
    handleTaskStatusChange,

    ledgerEntries,
    ledgerLoading,
    ledgerFrom,
    ledgerTo,
    ledgerType,
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
    uploadingDocument,
    uploadDocument,

    newEntryType,
    setNewEntryType,
    newEntryAmount,
    setNewEntryAmount,
    newEntryNote,
    setNewEntryNote,
    submittingLedgerEntry,
    submitLedgerEntry,
    deleteLedgerEntry,
  };
}
