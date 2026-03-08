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
  employeeCapabilitySnapshotFormSchema,
  employeeCompensationChangeFormSchema,
  employeeLedgerEntryFormSchema,
  type AttendanceRecord,
  type EmployeeCapability,
  type EmployeeCompensationHistoryEntry,
  type EmployeeCapabilitySnapshot,
  type CompensationChangeInput,
  type GarmentType,
  PaymentType,
  LedgerEntryType,
  type EmployeeLedgerEntry,
  type OrderItem,
  type OrderItemTask,
  type SystemSettings,
  type TaskStatus,
} from "@tbms/shared-types";
import { useUrlTableState } from "@/hooks/use-url-table-state";

interface EmployeeStatsSnapshot {
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
}

interface UseEmployeeDetailPageParams {
  employeeId: string | null;
}

function parseLedgerEntryType(value: string): LedgerEntryType | undefined {
  switch (value) {
    case LedgerEntryType.EARNING:
    case LedgerEntryType.PAYOUT:
    case LedgerEntryType.ADVANCE:
    case LedgerEntryType.DEDUCTION:
    case LedgerEntryType.ADJUSTMENT:
    case LedgerEntryType.SALARY:
      return value;
    default:
      return undefined;
  }
}

export function useEmployeeDetailPage({ employeeId }: UseEmployeeDetailPageParams) {
  const { toast } = useToast();
  const { values, setValues, getPositiveInt } = useUrlTableState({
    prefix: "ledger",
    defaults: {
      from: "",
      to: "",
      type: "all",
      page: "1",
      limit: "20",
    },
  });

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

  const [ledgerEntries, setLedgerEntries] = useState<EmployeeLedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const ledgerFrom = values.from;
  const ledgerTo = values.to;
  const ledgerType = values.type || "all";
  const ledgerPage = getPositiveInt("page", 1);
  const ledgerLimit = getPositiveInt("limit", 20);
  const [ledgerTotal, setLedgerTotal] = useState(0);

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);

  const [docLabel, setDocLabel] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [documentFieldErrors, setDocumentFieldErrors] = useState<{
    label?: string;
    url?: string;
  }>({});
  const [documentValidationError, setDocumentValidationError] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const [newEntryType, setNewEntryType] = useState<LedgerEntryType>(
    LedgerEntryType.ADJUSTMENT,
  );
  const [newEntryAmount, setNewEntryAmount] = useState("");
  const [newEntryNote, setNewEntryNote] = useState("");
  const [ledgerEntryFieldErrors, setLedgerEntryFieldErrors] = useState<{
    type?: string;
    amount?: string;
    note?: string;
  }>({});
  const [ledgerEntryValidationError, setLedgerEntryValidationError] = useState("");
  const [submittingLedgerEntry, setSubmittingLedgerEntry] = useState(false);
  const [ledgerEntryToReverseId, setLedgerEntryToReverseId] = useState<string | null>(
    null,
  );

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

  const fetchLedger = useCallback(
    async (page = ledgerPage) => {
      if (!employeeId) {
        return;
      }

      setLedgerLoading(true);
      try {
        const response = await ledgerApi.getStatement(employeeId, {
          from: ledgerFrom || undefined,
          to: ledgerTo || undefined,
          type: parseLedgerEntryType(ledgerType),
          page,
          limit: ledgerLimit,
        });

        if (response.success) {
          setLedgerEntries(response.data.entries);
          setLedgerTotal(response.data.meta.total);
          if (page !== ledgerPage) {
            setValues({ page: String(page) });
          }
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
    [employeeId, ledgerFrom, ledgerPage, ledgerTo, ledgerType, ledgerLimit, setValues, toast],
  );

  const setLedgerFrom = useCallback((value: string) => {
    setValues({
      from: value,
      page: "1",
    });
  }, [setValues]);

  const setLedgerTo = useCallback((value: string) => {
    setValues({
      to: value,
      page: "1",
    });
  }, [setValues]);

  const setLedgerType = useCallback((value: string) => {
    setValues({
      type: value,
      page: "1",
    });
  }, [setValues]);

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
      const flattenedErrors = parsedResult.error.flatten().fieldErrors;
      setLedgerEntryFieldErrors({
        type: flattenedErrors.type?.[0],
        amount: flattenedErrors.amount?.[0],
        note: flattenedErrors.note?.[0],
      });
      setLedgerEntryValidationError(
        flattenedErrors.type?.[0] ??
          flattenedErrors.amount?.[0] ??
          flattenedErrors.note?.[0] ??
          "Fix the highlighted fields and try again.",
      );
      return;
    }

    setLedgerEntryFieldErrors({});
    setLedgerEntryValidationError("");
    setSubmittingLedgerEntry(true);
    try {
      const isNegativeType = [
        LedgerEntryType.PAYOUT,
        LedgerEntryType.ADVANCE,
        LedgerEntryType.DEDUCTION,
      ].includes(newEntryType);

      const finalAmount = isNegativeType
        ? -Math.abs(parsedResult.data.amount)
        : Math.abs(parsedResult.data.amount);

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

  const reverseLedgerEntry = useCallback(
    async (entryId: string) => {
      try {
        const response = await ledgerApi.reverseEntry(entryId);
        if (response.success) {
          toast({ title: "Entry Reversed" });
          await Promise.all([fetchLedger(ledgerPage), fetchEmployeeData()]);
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to reverse entry",
          variant: "destructive",
        });
      }
    },
    [fetchEmployeeData, fetchLedger, ledgerPage, toast],
  );

  const requestLedgerEntryReverse = useCallback((entryId: string) => {
    setLedgerEntryToReverseId(entryId);
  }, []);

  const closeLedgerEntryReverseDialog = useCallback((open: boolean) => {
    if (!open) {
      setLedgerEntryToReverseId(null);
    }
  }, []);

  const confirmLedgerEntryReverse = useCallback(async () => {
    if (!ledgerEntryToReverseId) {
      return;
    }

    await reverseLedgerEntry(ledgerEntryToReverseId);
    setLedgerEntryToReverseId(null);
  }, [ledgerEntryToReverseId, reverseLedgerEntry]);

  const uploadDocument = useCallback(async () => {
    if (!employeeId) {
      return;
    }

    const parsedResult = employeeDocumentUploadFormSchema.safeParse({
      label: docLabel,
      url: docUrl,
    });
    if (!parsedResult.success) {
      const flattenedErrors = parsedResult.error.flatten().fieldErrors;
      setDocumentFieldErrors({
        label: flattenedErrors.label?.[0],
        url: flattenedErrors.url?.[0],
      });
      setDocumentValidationError(
        flattenedErrors.label?.[0] ??
          flattenedErrors.url?.[0] ??
          "Fix the highlighted fields and try again.",
      );
      return;
    }

    setDocumentFieldErrors({});
    setDocumentValidationError("");
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
    setDocLabel: (value: string) => {
      setDocumentFieldErrors((previous) => ({ ...previous, label: undefined }));
      setDocumentValidationError("");
      setDocLabel(value);
    },
    docUrl,
    setDocUrl: (value: string) => {
      setDocumentFieldErrors((previous) => ({ ...previous, url: undefined }));
      setDocumentValidationError("");
      setDocUrl(value);
    },
    documentFieldErrors,
    documentValidationError,
    uploadingDocument,
    uploadDocument,

    newEntryType,
    setNewEntryType: (value: LedgerEntryType) => {
      setLedgerEntryFieldErrors((previous) => ({ ...previous, type: undefined }));
      setLedgerEntryValidationError("");
      setNewEntryType(value);
    },
    newEntryAmount,
    setNewEntryAmount: (value: string) => {
      setLedgerEntryFieldErrors((previous) => ({ ...previous, amount: undefined }));
      setLedgerEntryValidationError("");
      setNewEntryAmount(value);
    },
    newEntryNote,
    setNewEntryNote: (value: string) => {
      setLedgerEntryFieldErrors((previous) => ({ ...previous, note: undefined }));
      setLedgerEntryValidationError("");
      setNewEntryNote(value);
    },
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
