"use client";

import type {
  EmployeeCompensationHistoryEntry,
  PaymentType,
} from "@tbms/shared-types";
import { PaymentType as PaymentTypeValue } from "@tbms/shared-types";
import { PAYMENT_TYPE_LABELS } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeSection } from "@/components/employees/detail/employee-detail-section";
import { formatDate, formatPKR } from "@/lib/utils";

interface EmployeeCompensationFieldErrors {
  paymentType?: string;
  monthlySalary?: string;
  effectiveFrom?: string;
  note?: string;
}

interface EmployeeCompensationSectionProps {
  compensationHistory: EmployeeCompensationHistoryEntry[];
  canManageWorkforceGovernance: boolean;
  paymentType: PaymentType;
  monthlySalary: string;
  effectiveFrom: string;
  note: string;
  fieldErrors: EmployeeCompensationFieldErrors;
  validationError: string;
  setPaymentType: (value: PaymentType) => void;
  setMonthlySalary: (value: string) => void;
  setEffectiveFrom: (value: string) => void;
  setNote: (value: string) => void;
  clearFieldError: (field: keyof EmployeeCompensationFieldErrors) => void;
  clearValidationError: () => void;
  onSubmit: () => void;
}

export function EmployeeCompensationSection({
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
}: EmployeeCompensationSectionProps) {
  return (
    <EmployeeSection
      id="employee-compensation"
      title="Compensation Timeline"
      description="Track payment model and salary changes over time."
      badge={
        <Badge variant="default" size="xs" className="font-semibold">
          {compensationHistory.length} CHANGES
        </Badge>
      }
      defaultOpen={false}
    >
      <div className="space-y-4 p-4 sm:p-5">
        <DataTable<EmployeeCompensationHistoryEntry>
          columns={[
            {
              header: "Model",
              cell: (entry) => (
                <Badge variant="outline" size="xs">
                  {PAYMENT_TYPE_LABELS[entry.paymentType]}
                </Badge>
              ),
            },
            {
              header: "Monthly Salary",
              align: "right",
              cell: (entry) => (
                <span className="font-medium">
                  {entry.monthlySalary != null
                    ? formatPKR(entry.monthlySalary)
                    : "-"}
                </span>
              ),
            },
            {
              header: "Window",
              cell: (entry) => (
                <span className="text-xs text-muted-foreground">
                  {formatDate(entry.effectiveFrom)}
                  {entry.effectiveTo
                    ? ` → ${formatDate(entry.effectiveTo)}`
                    : " onwards"}
                </span>
              ),
            },
          ]}
          data={compensationHistory}
          loading={false}
          chrome="flat"
          emptyMessage="No compensation history available."
        />

        {canManageWorkforceGovernance ? (
          <InfoTile tone="default" padding="contentLg" className="space-y-4">
            {validationError ? (
              <p className="text-sm text-destructive">{validationError}</p>
            ) : null}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div>
                <Label className="text-sm font-bold uppercase  text-muted-foreground">
                  Payment Model
                </Label>
                <Select
                  value={paymentType}
                  onValueChange={(value) => {
                    if (
                      value === PaymentTypeValue.PER_PIECE ||
                      value === PaymentTypeValue.MONTHLY_FIXED
                    ) {
                      clearFieldError("paymentType");
                      clearValidationError();
                      setPaymentType(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentTypeValue.PER_PIECE}>
                      Per Piece
                    </SelectItem>
                    <SelectItem value={PaymentTypeValue.MONTHLY_FIXED}>
                      Monthly Fixed
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.paymentType ? (
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.paymentType}
                  </p>
                ) : null}
              </div>

              {paymentType === PaymentTypeValue.MONTHLY_FIXED ? (
                <div>
                  <Label className="text-sm font-bold uppercase  text-muted-foreground">
                    Monthly Salary (Rs)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={monthlySalary}
                    onChange={(event) => {
                      clearFieldError("monthlySalary");
                      clearValidationError();
                      setMonthlySalary(event.target.value);
                    }}
                  />
                  {fieldErrors.monthlySalary ? (
                    <p className="mt-1 text-xs text-destructive">
                      {fieldErrors.monthlySalary}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <Label className="text-sm font-bold uppercase  text-muted-foreground">
                  Effective From
                </Label>
                <Input
                  type="date"
                  value={effectiveFrom}
                  onChange={(event) => {
                    clearFieldError("effectiveFrom");
                    clearValidationError();
                    setEffectiveFrom(event.target.value);
                  }}
                />
                {fieldErrors.effectiveFrom ? (
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.effectiveFrom}
                  </p>
                ) : null}
              </div>
              <div>
                <Label className="text-sm font-bold uppercase  text-muted-foreground">
                  Note
                </Label>
                <Input
                  value={note}
                  onChange={(event) => {
                    clearFieldError("note");
                    clearValidationError();
                    setNote(event.target.value);
                  }}
                  placeholder="Optional"
                />
                {fieldErrors.note ? (
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.note}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={onSubmit}>
                Schedule Compensation Change
              </Button>
            </div>
          </InfoTile>
        ) : null}
      </div>
    </EmployeeSection>
  );
}
