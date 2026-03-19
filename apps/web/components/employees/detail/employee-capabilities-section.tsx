"use client";

import { useCallback, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import type {
  EmployeeCapabilityWindowInput,
  GarmentType,
} from "@tbms/shared-types";
import { type PaginationState, type SortingState } from "@tanstack/react-table";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { FieldError, FieldHint, FieldLabel } from "@tbms/ui/components/field";
import { FormGrid } from "@tbms/ui/components/form-layout";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { Input } from "@tbms/ui/components/input";
import { SectionHeader } from "@tbms/ui/components/section-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { EmployeeSection } from "@/components/employees/detail/employee-detail-section";
import type { EmployeeCapabilityWithStatus } from "@/hooks/use-employee-capabilities-manager";
import { formatDate } from "@/lib/utils";

interface EmployeeCapabilitiesSectionProps {
  capabilitiesWithStatus: EmployeeCapabilityWithStatus[];
  activeCapabilitiesCount: number;
  upcomingCapabilitiesCount: number;
  garmentTypes: GarmentType[];
  garmentNameById: Map<string, string>;
  capabilityEffectiveFrom: string;
  capabilityNote: string;
  capabilityRows: EmployeeCapabilityWindowInput[];
  capabilityValidationError: string;
  canManageWorkforceGovernance: boolean;
  setCapabilityEffectiveFrom: (value: string) => void;
  setCapabilityNote: (value: string) => void;
  addCapabilityRow: () => void;
  removeCapabilityRow: (index: number) => void;
  updateCapabilityRow: (
    index: number,
    updater: Partial<EmployeeCapabilityWindowInput>,
  ) => void;
  getStepOptionsForCapabilityRow: (garmentTypeId?: string) => string[];
  onSubmit: () => void;
}

export function EmployeeCapabilitiesSection({
  capabilitiesWithStatus,
  activeCapabilitiesCount,
  upcomingCapabilitiesCount,
  garmentTypes,
  garmentNameById,
  capabilityEffectiveFrom,
  capabilityNote,
  capabilityRows,
  capabilityValidationError,
  canManageWorkforceGovernance,
  setCapabilityEffectiveFrom,
  setCapabilityNote,
  addCapabilityRow,
  removeCapabilityRow,
  updateCapabilityRow,
  getStepOptionsForCapabilityRow,
  onSubmit,
}: EmployeeCapabilitiesSectionProps) {
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: 0,
      pageSize: Math.max(capabilitiesWithStatus.length, 1),
    }),
    [capabilitiesWithStatus.length],
  );
  const onPaginationChange = useCallback(
    (
      updater: PaginationState | ((old: PaginationState) => PaginationState),
    ) => {
      void updater;
    },
    [],
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
      id="employee-capabilities"
      title="Capabilities"
      description="Define which garments and steps this employee can be assigned to."
      badge={
        <Badge variant="default" className="font-semibold">
          {activeCapabilitiesCount} ACTIVE
        </Badge>
      }
      defaultOpen
      collapsible={false}
    >
      <div className="space-y-4 p-4 sm:p-5">
        {upcomingCapabilitiesCount > 0 ? (
          <FieldHint>
            {upcomingCapabilitiesCount} upcoming capability
            {upcomingCapabilitiesCount === 1 ? "" : "ies"} scheduled.
          </FieldHint>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,1fr)]">
          <InfoTile tone="secondary" padding="contentLg" className="space-y-4">
            <SectionHeader
              title="Current Capability Windows"
              description="Review the latest active, upcoming, and expired assignment windows before making changes."
              titleClassName="text-sm"
            />
            <DataTableTanstack
              columns={[
                {
                  id: "garmentType",
                  header: "Garment Type",
                  cell: ({ row }) => (
                    <span className="font-medium">
                      {row.original.garmentTypeId
                        ? (garmentNameById.get(row.original.garmentTypeId) ??
                          row.original.garmentTypeId)
                        : "Any"}
                    </span>
                  ),
                },
                {
                  id: "stepKey",
                  header: "Step Key",
                  cell: ({ row }) => (
                    <span className="font-mono text-xs">
                      {row.original.stepKey || "Any"}
                    </span>
                  ),
                },
                {
                  id: "status",
                  header: "Status",
                  cell: ({ row }) => (
                    <Badge
                      variant={
                        row.original.status === "ACTIVE"
                          ? "default"
                          : row.original.status === "UPCOMING"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {row.original.status}
                    </Badge>
                  ),
                },
                {
                  id: "effective",
                  header: "Effective",
                  cell: ({ row }) => (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(row.original.effectiveFrom)}
                      {row.original.effectiveTo
                        ? ` → ${formatDate(row.original.effectiveTo)}`
                        : " onwards"}
                    </span>
                  ),
                },
              ]}
              data={capabilitiesWithStatus}
              loading={false}
              chrome="flat"
              emptyMessage="No capability windows configured."
              pagination={pagination}
              onPaginationChange={onPaginationChange}
              pageCount={1}
              totalCount={capabilitiesWithStatus.length}
              sorting={sorting}
              onSortingChange={onSortingChange}
            />
          </InfoTile>

          {canManageWorkforceGovernance ? (
            <InfoTile tone="default" padding="contentLg" className="space-y-4">
              <SectionHeader
                title="Update Capability Snapshot"
                description="Save the next clean assignment-ready snapshot without editing the history table inline."
                titleClassName="text-sm"
              />

              <FormGrid columns="two">
                <div>
                  <FieldLabel>Effective From</FieldLabel>
                  <Input
                    type="date"
                    value={capabilityEffectiveFrom}
                    onChange={(event) =>
                      setCapabilityEffectiveFrom(event.target.value)
                    }
                  />
                </div>
                <div>
                  <FieldLabel>Snapshot Note</FieldLabel>
                  <Input
                    value={capabilityNote}
                    onChange={(event) => setCapabilityNote(event.target.value)}
                    placeholder="Optional context for this update"
                  />
                </div>
              </FormGrid>

              <div className="space-y-2">
                {capabilityRows.map((row, index) => {
                  const stepOptions = getStepOptionsForCapabilityRow(
                    row.garmentTypeId ?? undefined,
                  );
                  const visibleStepOptions =
                    row.stepKey && !stepOptions.includes(row.stepKey)
                      ? [row.stepKey, ...stepOptions]
                      : stepOptions;

                  return (
                    <div
                      key={`capability-row-${index}`}
                      className="grid grid-cols-1 gap-3 rounded-xl border border-border p-3 md:grid-cols-12"
                    >
                      <div className="md:col-span-4">
                        <FieldLabel>Garment Type</FieldLabel>
                        <Select
                          value={row.garmentTypeId || "ANY"}
                          onValueChange={(value) => {
                            const nextValue = value ?? "ANY";
                            const nextGarmentTypeId =
                              nextValue === "ANY" ? "" : nextValue;
                            const nextStepOptions =
                              getStepOptionsForCapabilityRow(nextGarmentTypeId);
                            updateCapabilityRow(index, {
                              garmentTypeId: nextGarmentTypeId,
                              stepKey:
                                row.stepKey && nextStepOptions.includes(row.stepKey)
                                  ? row.stepKey
                                  : "",
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any garment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ANY">Any garment</SelectItem>
                            {garmentTypes.map((garmentType) => (
                              <SelectItem
                                key={garmentType.id}
                                value={garmentType.id}
                              >
                                {garmentType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-4">
                        <FieldLabel>Step Key</FieldLabel>
                        <Select
                          value={row.stepKey || "ANY_STEP"}
                          onValueChange={(value) =>
                            updateCapabilityRow(index, {
                              stepKey:
                                (value ?? "ANY_STEP") === "ANY_STEP"
                                  ? ""
                                  : (value ?? "ANY_STEP"),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any step" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ANY_STEP">Any step</SelectItem>
                            {visibleStepOptions.map((stepKey) => (
                              <SelectItem key={stepKey} value={stepKey}>
                                {stepKey}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {row.garmentTypeId && stepOptions.length === 0 ? (
                          <FieldHint className="mt-1 text-secondary-foreground">
                            No workflow steps configured for this garment.
                          </FieldHint>
                        ) : null}
                      </div>

                      <div className="md:col-span-3">
                        <FieldLabel>Note</FieldLabel>
                        <Input
                          value={row.note ?? ""}
                          onChange={(event) =>
                            updateCapabilityRow(index, {
                              note: event.target.value,
                            })
                          }
                          placeholder="Optional"
                        />
                      </div>

                      <div className="flex items-end md:col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeCapabilityRow(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCapabilityRow}
                >
                  <Plus className="h-4 w-4" />
                  Add Capability
                </Button>
                <div className="flex flex-col items-end gap-2">
                  {capabilityValidationError ? (
                    <FieldError size="sm">{capabilityValidationError}</FieldError>
                  ) : null}
                  <Button type="button" size="sm" onClick={onSubmit}>
                    Save Capability Snapshot
                  </Button>
                </div>
              </div>
            </InfoTile>
          ) : null}
        </div>
      </div>
    </EmployeeSection>
  );
}
