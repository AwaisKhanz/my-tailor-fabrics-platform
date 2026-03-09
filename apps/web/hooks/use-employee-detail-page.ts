"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { employeesApi } from "@/lib/api/employees";
import { ordersApi } from "@/lib/api/orders";
import { useEmployeeDetailData } from "@/hooks/use-employee-detail-data";
import { useEmployeeDocumentManager } from "@/hooks/use-employee-document-manager";
import { useEmployeeLedgerManager } from "@/hooks/use-employee-ledger-manager";
import {
  employeeCapabilitySnapshotFormSchema,
  employeeCompensationChangeFormSchema,
  type EmployeeCapabilitySnapshot,
  type CompensationChangeInput,
  PaymentType,
  type TaskStatus,
} from "@tbms/shared-types";

interface UseEmployeeDetailPageParams {
  employeeId: string | null;
}

export function useEmployeeDetailPage({ employeeId }: UseEmployeeDetailPageParams) {
  const { toast } = useToast();

  const {
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
  } = useEmployeeDetailData({
    employeeId,
  });

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

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
    [employeeId, fetchEmployeeData, setCapabilities, toast],
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
