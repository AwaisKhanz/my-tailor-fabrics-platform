"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
  EmployeeCapability,
  EmployeeCapabilityWindowInput,
  GarmentType,
} from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FieldError, FieldHint, FieldLabel } from "@/components/ui/field";
import { FormGrid } from "@/components/ui/form-layout";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/typography";
import { EmployeeSection } from "@/components/employees/detail/employee-detail-section";
import { formatDate } from "@/lib/utils";

interface EmployeeCapabilitiesSectionProps {
  activeCapabilities: EmployeeCapability[];
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
  activeCapabilities,
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
  return (
    <EmployeeSection
      id="employee-capabilities"
      title="Capabilities"
      description="Define which garments and steps this employee can be assigned to."
      badge={
        <Badge variant="default" size="xs" className="font-semibold">
          {activeCapabilities.length} ACTIVE
        </Badge>
      }
      defaultOpen
    >
      <div className="space-y-4 p-4 sm:p-5">
        <DataTable<EmployeeCapability>
          columns={[
            {
              header: "Garment Type",
              cell: (capability) => (
                <span className="font-medium">
                  {capability.garmentTypeId
                    ? (garmentNameById.get(capability.garmentTypeId) ??
                      capability.garmentTypeId)
                    : "Any"}
                </span>
              ),
            },
            {
              header: "Step Key",
              cell: (capability) => (
                <span className="font-mono text-xs">
                  {capability.stepKey || "Any"}
                </span>
              ),
            },
            {
              header: "Effective",
              cell: (capability) => (
                <span className="text-xs text-muted-foreground">
                  {formatDate(capability.effectiveFrom)}
                  {capability.effectiveTo
                    ? ` → ${formatDate(capability.effectiveTo)}`
                    : " onwards"}
                </span>
              ),
            },
          ]}
          data={activeCapabilities}
          loading={false}
          chrome="flat"
          emptyMessage="No active capabilities configured."
        />

        {canManageWorkforceGovernance ? (
          <InfoTile tone="default" padding="contentLg" className="space-y-4">
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
                    className="grid grid-cols-1 gap-2 rounded-xl border border-border p-3 md:grid-cols-12"
                  >
                    <div className="md:col-span-4">
                      <FieldLabel>Garment Type</FieldLabel>
                      <Select
                        value={row.garmentTypeId || "ANY"}
                        onValueChange={(value) => {
                          const nextGarmentTypeId =
                            value === "ANY" ? "" : value;
                          const nextStepOptions =
                            getStepOptionsForCapabilityRow(nextGarmentTypeId);
                          updateCapabilityRow(index, {
                            garmentTypeId: nextGarmentTypeId,
                            stepKey:
                              row.stepKey &&
                              nextStepOptions.includes(row.stepKey)
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
                            stepKey: value === "ANY_STEP" ? "" : value,
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
    </EmployeeSection>
  );
}
