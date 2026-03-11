"use client";

import type {
  EmployeeCompensationHistoryEntry,
  PaymentType,
} from "@tbms/shared-types";
import { PaymentType as PaymentTypeValue } from "@tbms/shared-types";
import { PAYMENT_TYPE_LABELS } from "@tbms/shared-constants";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTable } from "@tbms/ui/components/data-table";
import { FieldError, FieldLabel } from "@tbms/ui/components/field";
import { FormGrid } from "@tbms/ui/components/form-layout";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { Input } from "@tbms/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
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
        <Badge variant="default" className="font-semibold">
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
                <Badge variant="outline">
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
              <FieldError size="sm">{validationError}</FieldError>
            ) : null}
            <FormGrid>
              <div>
                <FieldLabel>Payment Model</FieldLabel>
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
                  <FieldError inset>{fieldErrors.paymentType}</FieldError>
                ) : null}
              </div>

              {paymentType === PaymentTypeValue.MONTHLY_FIXED ? (
                <div>
                  <FieldLabel>Monthly Salary (Rs)</FieldLabel>
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
                    <FieldError inset>{fieldErrors.monthlySalary}</FieldError>
                  ) : null}
                </div>
              ) : null}

              <div>
                <FieldLabel>Effective From</FieldLabel>
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
                  <FieldError inset>{fieldErrors.effectiveFrom}</FieldError>
                ) : null}
              </div>
              <div>
                <FieldLabel>Note</FieldLabel>
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
                  <FieldError inset>{fieldErrors.note}</FieldError>
                ) : null}
              </div>
            </FormGrid>

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
