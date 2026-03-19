"use client";

import type {
  EmployeeCompensationHistoryEntry,
  EmployeeLedgerEntry,
  PaymentType,
} from "@tbms/shared-types";
import type { ColumnDef } from "@tanstack/react-table";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { EmployeeCompensationSection } from "@/components/employees/detail/employee-compensation-section";
import { EmployeeLedgerSection } from "@/components/employees/detail/employee-ledger-section";

interface EmployeeMoneyTabProps {
  compensationHistory: EmployeeCompensationHistoryEntry[];
  canManageWorkforceGovernance: boolean;
  paymentType: PaymentType;
  monthlySalary: string;
  effectiveFrom: string;
  note: string;
  fieldErrors: {
    paymentType?: string;
    monthlySalary?: string;
    effectiveFrom?: string;
    note?: string;
  };
  validationError: string;
  setPaymentType: (value: PaymentType) => void;
  setMonthlySalary: (value: string) => void;
  setEffectiveFrom: (value: string) => void;
  setNote: (value: string) => void;
  clearFieldError: (
    field: "paymentType" | "monthlySalary" | "effectiveFrom" | "note",
  ) => void;
  clearValidationError: () => void;
  onSubmit: () => void;
  ledgerEntries: EmployeeLedgerEntry[];
  ledgerLoading: boolean;
  ledgerFrom: string;
  ledgerTo: string;
  ledgerType: string;
  ledgerTypeFilterOptions: { value: string; label: string }[];
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

export function EmployeeMoneyTab({
  compensationHistory,
  canManageWorkforceGovernance,
  paymentType,
  monthlySalary,
  effectiveFrom,
  note,
  fieldErrors,
  validationError,
  setPaymentType,
  setMonthlySalary,
  setEffectiveFrom,
  setNote,
  clearFieldError,
  clearValidationError,
  onSubmit,
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
}: EmployeeMoneyTabProps) {
  return (
    <div className="space-y-6">
      <StatsGrid columns="threeMd" className="gap-4">
        <InfoTile tone="secondary" padding="contentLg" className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Earned vs Paid
          </p>
          <p className="text-sm text-foreground">
            This tab tracks what the employee has generated, what has already
            been disbursed, and what remains payable.
          </p>
        </InfoTile>
        <InfoTile tone="secondary" padding="contentLg" className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Compensation Windows
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {compensationHistory.length}
          </p>
          <p className="text-xs text-muted-foreground">
            Historical compensation records
          </p>
        </InfoTile>
        <InfoTile tone="secondary" padding="contentLg" className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ledger Entries
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {ledgerTotal}
          </p>
          <p className="text-xs text-muted-foreground">
            Manual and workflow-linked entries
          </p>
        </InfoTile>
      </StatsGrid>

      <EmployeeCompensationSection
        compensationHistory={compensationHistory}
        canManageWorkforceGovernance={canManageWorkforceGovernance}
        paymentType={paymentType}
        monthlySalary={monthlySalary}
        effectiveFrom={effectiveFrom}
        note={note}
        fieldErrors={fieldErrors}
        validationError={validationError}
        setPaymentType={setPaymentType}
        setMonthlySalary={setMonthlySalary}
        setEffectiveFrom={setEffectiveFrom}
        setNote={setNote}
        clearFieldError={clearFieldError}
        clearValidationError={clearValidationError}
        onSubmit={onSubmit}
      />

      <EmployeeLedgerSection
        ledgerEntries={ledgerEntries}
        ledgerLoading={ledgerLoading}
        ledgerFrom={ledgerFrom}
        ledgerTo={ledgerTo}
        ledgerType={ledgerType}
        ledgerTypeFilterOptions={ledgerTypeFilterOptions}
        ledgerPage={ledgerPage}
        ledgerTotal={ledgerTotal}
        ledgerLimit={ledgerLimit}
        columns={columns}
        canManageLedger={canManageLedger}
        allTypesLabel={allTypesLabel}
        setLedgerFrom={setLedgerFrom}
        setLedgerTo={setLedgerTo}
        setLedgerType={setLedgerType}
        onFetchLedger={onFetchLedger}
        onOpenLedgerDialog={onOpenLedgerDialog}
      />
    </div>
  );
}
