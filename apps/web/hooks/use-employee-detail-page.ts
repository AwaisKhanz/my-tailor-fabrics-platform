"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useEmployeeDetailData } from "@/hooks/use-employee-detail-data";
import { useEmployeeDocumentManager } from "@/hooks/use-employee-document-manager";
import { useEmployeeLedgerManager } from "@/hooks/use-employee-ledger-manager";
import {
  useCreateCompensationChange,
  useReplaceEmployeeCapabilities,
} from "@/hooks/queries/employee-queries";
import { useUpdateOrderTaskStatus } from "@/hooks/queries/order-queries";
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
  canReadLedger?: boolean;
  canReadSystemSettings?: boolean;
}

export function useEmployeeDetailPage({
  employeeId,
  canReadLedger = true,
  canReadSystemSettings = true,
}: UseEmployeeDetailPageParams) {
  const { toast } = useToast();
  const replaceEmployeeCapabilitiesMutation = useReplaceEmployeeCapabilities();
  const createCompensationChangeMutation = useCreateCompensationChange();
  const updateOrderTaskStatusMutation = useUpdateOrderTaskStatus();

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
    canReadSystemSettings,
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
    enabled: canReadLedger,
    fetchEmployeeData,
    toast,
  });

  const handleTaskStatusChange = useCallback(
    async (taskId: string, status: TaskStatus) => {
      if (!employeeId) {
        return;
      }

      try {
        await updateOrderTaskStatusMutation.mutateAsync({
          taskId,
          status,
        });
        toast({ title: "Status Updated" });
        await fetchEmployeeData();
      } catch {
        toast({ title: "Update Failed", variant: "destructive" });
      }
    },
    [employeeId, fetchEmployeeData, toast, updateOrderTaskStatusMutation],
  );

  const saveCapabilitiesSnapshot = useCallback(
    async (snapshot: EmployeeCapabilitySnapshot) => {
      if (!employeeId) {
        return false;
      }

      const parsedResult =
        employeeCapabilitySnapshotFormSchema.safeParse(snapshot);
      if (!parsedResult.success) {
        return false;
      }

      try {
        const response = await replaceEmployeeCapabilitiesMutation.mutateAsync({
          id: employeeId,
          data: parsedResult.data,
        });

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
    [
      employeeId,
      fetchEmployeeData,
      replaceEmployeeCapabilitiesMutation,
      setCapabilities,
      toast,
    ],
  );

  const scheduleCompensationChange = useCallback(
    async (change: CompensationChangeInput) => {
      if (!employeeId) {
        return false;
      }

      const parsedResult =
        employeeCompensationChangeFormSchema.safeParse(change);
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

        const response = await createCompensationChangeMutation.mutateAsync({
          id: employeeId,
          data: payload,
        });

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
    [createCompensationChangeMutation, employeeId, fetchEmployeeData, toast],
  );

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
