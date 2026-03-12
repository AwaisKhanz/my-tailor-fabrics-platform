"use client";

import { useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import type { EmployeeLedgerEntry } from "@tbms/shared-types";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { Input } from "@tbms/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { EmployeeSection } from "@/components/employees/detail/employee-detail-section";
import { resolveUpdater } from "@/lib/tanstack";

interface EmployeeLedgerSectionProps {
  ledgerEntries: EmployeeLedgerEntry[];
  ledgerLoading: boolean;
  ledgerFrom: string;
  ledgerTo: string;
  ledgerType: string;
  ledgerTypeFilterOptions: {
    value: string;
    label: string;
  }[];
  ledgerPage: number;
  ledgerTotal: number;
  ledgerLimit: number;
  columns: ColumnDef<EmployeeLedgerEntry>[];
  canManageLedger: boolean;
  allTypesLabel: string;
  setLedgerFrom: (value: string) => void;
  setLedgerTo: (value: string) => void;
  setLedgerType: (value: string) => void;
  onFetchLedger: (page?: number) => void;
  onOpenLedgerDialog: () => void;
}

export function EmployeeLedgerSection({
  ledgerEntries,
  ledgerLoading,
  ledgerFrom,
  ledgerTo,
  ledgerType,
  ledgerTypeFilterOptions,
  ledgerPage,
  ledgerTotal,
  ledgerLimit,
  columns,
  canManageLedger,
  allTypesLabel,
  setLedgerFrom,
  setLedgerTo,
  setLedgerType,
  onFetchLedger,
  onOpenLedgerDialog,
}: EmployeeLedgerSectionProps) {
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(ledgerPage - 1, 0),
      pageSize: ledgerLimit,
    }),
    [ledgerLimit, ledgerPage],
  );
  const onPaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = resolveUpdater(updater, pagination);
      onFetchLedger(next.pageIndex + 1);
    },
    [onFetchLedger, pagination],
  );
  const sorting = useMemo<SortingState>(() => [], []);
  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      void updater;
    },
    [],
  );

  return (
    <EmployeeSection
      id="employee-ledger"
      title="Ledger"
      description="Track payouts, deductions, and adjustments with filterable history."
      badge={
        <Badge variant="default" className="font-semibold">
          {ledgerTotal} ENTRIES
        </Badge>
      }
      action={
        canManageLedger ? (
          <Button
            size="sm"
            variant="default"
            className="h-8 w-full sm:w-auto"
            onClick={onOpenLedgerDialog}
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        ) : null
      }
      defaultOpen={false}
      onFirstOpen={() => {
        if (ledgerEntries.length === 0 && !ledgerLoading) {
          onFetchLedger(1);
        }
      }}
    >
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            type="date"
            className="h-8 w-full px-2 text-xs md:w-36"
            value={ledgerFrom}
            onChange={(event) => setLedgerFrom(event.target.value)}
          />
          <Input
            type="date"
            className="h-8 w-full px-2 text-xs md:w-36"
            value={ledgerTo}
            onChange={(event) => setLedgerTo(event.target.value)}
          />
          <Select
            value={ledgerType}
            onValueChange={(value) => setLedgerType(value ?? "all")}
          >
            <SelectTrigger className="h-8 w-full text-xs md:w-[140px]">
              <SelectValue placeholder={allTypesLabel} />
            </SelectTrigger>
            <SelectContent>
              {ledgerTypeFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-full md:w-auto"
            onClick={() => onFetchLedger(1)}
          >
            Filter
          </Button>
        </div>

        <DataTableTanstack
          columns={columns}
          data={ledgerEntries}
          loading={ledgerLoading}
          emptyMessage="No ledger entries found."
          chrome="flat"
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          pageCount={Math.max(1, Math.ceil(ledgerTotal / ledgerLimit))}
          totalCount={ledgerTotal}
          manualPagination
          sorting={sorting}
          onSortingChange={onSortingChange}
        />
      </div>
    </EmployeeSection>
  );
}
