"use client";

import { useCallback, useMemo, useState } from "react";
import type { useToast } from "@/hooks/use-toast";
import {
  useCreateLedgerEntry,
  useLedgerStatement,
  useReverseLedgerEntry,
} from "@/hooks/queries/ledger-queries";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import {
  employeeLedgerEntryFormSchema,
  isLedgerEntryType,
  LedgerEntryType,
  type EmployeeLedgerEntry,
} from "@tbms/shared-types";
import { LEDGER_ENTRY_TYPE_OPTIONS } from "@tbms/shared-constants";

export const EMPLOYEE_LEDGER_ALL_TYPES_FILTER = "all";
export const EMPLOYEE_LEDGER_ALL_TYPES_LABEL = "All Types";

type ToastFn = ReturnType<typeof useToast>["toast"];

interface UseEmployeeLedgerManagerParams {
  employeeId: string | null;
  fetchEmployeeData: () => Promise<void>;
  toast: ToastFn;
}

function parseLedgerEntryType(value: string): LedgerEntryType | undefined {
  return isLedgerEntryType(value) ? value : undefined;
}

export function useEmployeeLedgerManager({
  employeeId,
  fetchEmployeeData,
  toast,
}: UseEmployeeLedgerManagerParams) {
  const { values, setValues, getPositiveInt } = useUrlTableState({
    prefix: "ledger",
    defaults: {
      from: "",
      to: "",
      type: EMPLOYEE_LEDGER_ALL_TYPES_FILTER,
      page: "1",
      limit: "20",
    },
  });
  const createLedgerEntryMutation = useCreateLedgerEntry();
  const reverseLedgerEntryMutation = useReverseLedgerEntry();
  const ledgerFrom = values.from;
  const ledgerTo = values.to;
  const ledgerType = values.type || EMPLOYEE_LEDGER_ALL_TYPES_FILTER;
  const ledgerPage = getPositiveInt("page", 1);
  const ledgerLimit = getPositiveInt("limit", 20);
  const ledgerQuery = useLedgerStatement(employeeId, {
    from: ledgerFrom || undefined,
    to: ledgerTo || undefined,
    type: parseLedgerEntryType(ledgerType),
    page: ledgerPage,
    limit: ledgerLimit,
  });
  const ledgerEntries: EmployeeLedgerEntry[] = ledgerQuery.data?.success
    ? ledgerQuery.data.data.entries
    : [];
  const ledgerLoading = ledgerQuery.isLoading || ledgerQuery.isFetching;
  const ledgerTotal = ledgerQuery.data?.success
    ? ledgerQuery.data.data.meta.total
    : 0;

  const ledgerTypeFilterOptions = useMemo(
    () => [
      {
        value: EMPLOYEE_LEDGER_ALL_TYPES_FILTER,
        label: EMPLOYEE_LEDGER_ALL_TYPES_LABEL,
      },
      ...LEDGER_ENTRY_TYPE_OPTIONS,
    ],
    [],
  );

  const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);
  const [newEntryType, setNewEntryTypeState] = useState<LedgerEntryType>(
    LedgerEntryType.ADJUSTMENT,
  );
  const [newEntryAmount, setNewEntryAmountState] = useState("");
  const [newEntryNote, setNewEntryNoteState] = useState("");
  const [ledgerEntryFieldErrors, setLedgerEntryFieldErrors] = useState<{
    type?: string;
    amount?: string;
    note?: string;
  }>({});
  const [ledgerEntryValidationError, setLedgerEntryValidationError] =
    useState("");
  const submittingLedgerEntry = createLedgerEntryMutation.isPending;
  const [ledgerEntryToReverseId, setLedgerEntryToReverseId] = useState<
    string | null
  >(null);

  const fetchLedger = useCallback(
    async (page = ledgerPage) => {
      if (!employeeId) {
        return;
      }

      try {
        if (page !== ledgerPage) {
          setValues({ page: String(page) });
          return;
        }

        await ledgerQuery.refetch();
      } catch {
        toast({
          title: "Error",
          description: "Failed to load ledger",
          variant: "destructive",
        });
      }
    },
    [employeeId, ledgerQuery, ledgerPage, setValues, toast],
  );

  const setLedgerFrom = useCallback(
    (value: string) => {
      setValues({
        from: value,
        page: "1",
      });
    },
    [setValues],
  );

  const setLedgerTo = useCallback(
    (value: string) => {
      setValues({
        to: value,
        page: "1",
      });
    },
    [setValues],
  );

  const setLedgerType = useCallback(
    (value: string) => {
      setValues({
        type: value,
        page: "1",
      });
    },
    [setValues],
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

    try {
      const isNegativeType = [
        LedgerEntryType.PAYOUT,
        LedgerEntryType.ADVANCE,
        LedgerEntryType.DEDUCTION,
      ].includes(newEntryType);

      const finalAmount = isNegativeType
        ? -Math.abs(parsedResult.data.amount)
        : Math.abs(parsedResult.data.amount);

      const response = await createLedgerEntryMutation.mutateAsync({
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
        setNewEntryAmountState("");
        setNewEntryNoteState("");
        await Promise.all([fetchLedger(1), fetchEmployeeData()]);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create ledger entry",
        variant: "destructive",
      });
    }
  }, [
    createLedgerEntryMutation,
    employeeId,
    fetchEmployeeData,
    fetchLedger,
    newEntryAmount,
    newEntryNote,
    newEntryType,
    toast,
  ]);

  const reverseLedgerEntry = useCallback(
    async (entryId: string) => {
      if (!employeeId) {
        return;
      }

      try {
        const response = await reverseLedgerEntryMutation.mutateAsync({
          id: entryId,
          employeeId,
        });
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
    [
      employeeId,
      fetchEmployeeData,
      fetchLedger,
      ledgerPage,
      reverseLedgerEntryMutation,
      toast,
    ],
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

  return {
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
    setNewEntryType: (value: LedgerEntryType) => {
      setLedgerEntryFieldErrors((previous) => ({
        ...previous,
        type: undefined,
      }));
      setLedgerEntryValidationError("");
      setNewEntryTypeState(value);
    },
    newEntryAmount,
    setNewEntryAmount: (value: string) => {
      setLedgerEntryFieldErrors((previous) => ({
        ...previous,
        amount: undefined,
      }));
      setLedgerEntryValidationError("");
      setNewEntryAmountState(value);
    },
    newEntryNote,
    setNewEntryNote: (value: string) => {
      setLedgerEntryFieldErrors((previous) => ({
        ...previous,
        note: undefined,
      }));
      setLedgerEntryValidationError("");
      setNewEntryNoteState(value);
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
