"use client";

import {
  DialogFormActions,
  DialogSection,
  FormGrid,
  FormStack,
} from "@/components/ui/form-layout";
import {
  FieldError,
  FieldHint,
  FieldLabel,
  FieldStack,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banknote, Calendar } from "lucide-react";
import { type CreateRateCardInput } from "@tbms/shared-types";
import {
  type RateCardDialogInitialRate,
  useRateCardForm,
} from "@/hooks/use-rate-card-form";

interface CreateRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRateCardInput) => Promise<void>;
  garmentTypes: { id: string; name: string }[];
  branches: { id: string; name: string; code: string }[];
  steps?: string[];
  stepsByGarmentTypeId?: Record<string, string[]>;
  mode?: "create" | "adjust";
  initialRate?: RateCardDialogInitialRate | null;
}

export function CreateRateDialog({
  open,
  onOpenChange,
  onSubmit,
  garmentTypes,
  branches,
  steps = [],
  stepsByGarmentTypeId,
  mode = "create",
  initialRate = null,
}: CreateRateDialogProps) {
  const {
    loading,
    formData,
    fieldErrors,
    formError,
    isAdjustMode,
    availableSteps,
    hasGarmentSelected,
    hasAvailableSteps,
    noStepsConfigured,
    branchScopeOptions,
    setBranchId,
    setGarmentTypeId,
    setStepKey,
    setAmount,
    setEffectiveFrom,
    submitForm,
  } = useRateCardForm({
    open,
    onOpenChange,
    onSubmit,
    branches,
    steps,
    stepsByGarmentTypeId,
    mode,
    initialRate,
  });

  const dialogTitle = isAdjustMode ? "Adjust Rate Card" : "New Rate Card";
  const dialogDescription = isAdjustMode
    ? "Create a new version for this rate. Scope and step remain locked to preserve history."
    : "Create a new production rate for a specific garment step.";
  const submitText = isAdjustMode ? "Save Adjustment" : "Create Rate";
  const submittingText = isAdjustMode ? "Saving..." : "Creating...";

  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitText={submitText}
      submittingText={submittingText}
      submitting={loading}
      submitDisabled={noStepsConfigured}
      submitFormId="rate-card-form"
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={dialogTitle}
      description={dialogDescription}
      footerActions={footerActions}
    >
      <DialogSection className="pt-0">
        <FormStack
          as="form"
          id="rate-card-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submitForm();
          }}
        >
          <FieldStack>
            <FieldLabel htmlFor="branch">Branch Scope</FieldLabel>
            <Select
              value={formData.branchId}
              onValueChange={setBranchId}
              disabled={isAdjustMode}
            >
              <SelectTrigger id="branch">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branchScopeOptions.map((branch) => (
                  <SelectItem key={branch.value} value={branch.value}>
                    {branch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.branchId ? (
              <FieldError>{fieldErrors.branchId}</FieldError>
            ) : null}
          </FieldStack>

          <FieldStack>
            <FieldLabel htmlFor="garmentType">Garment Type</FieldLabel>
            <Select
              value={formData.garmentTypeId}
              onValueChange={setGarmentTypeId}
              disabled={isAdjustMode}
            >
              <SelectTrigger id="garmentType">
                <SelectValue placeholder="Select Garment Type" />
              </SelectTrigger>
              <SelectContent>
                {garmentTypes.map((garmentType) => (
                  <SelectItem key={garmentType.id} value={garmentType.id}>
                    {garmentType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.garmentTypeId ? (
              <FieldError>{fieldErrors.garmentTypeId}</FieldError>
            ) : null}
          </FieldStack>

          <FieldStack>
            <FieldLabel htmlFor="stepKey">Production Step</FieldLabel>
            <Select
              value={formData.stepKey}
              onValueChange={setStepKey}
              disabled={
                isAdjustMode || !hasGarmentSelected || !hasAvailableSteps
              }
            >
              <SelectTrigger id="stepKey">
                <SelectValue placeholder="Select Step" />
              </SelectTrigger>
              <SelectContent>
                {availableSteps.map((step) => (
                  <SelectItem key={step} value={step}>
                    {step}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.stepKey ? (
              <FieldError>{fieldErrors.stepKey}</FieldError>
            ) : null}
            {!hasGarmentSelected ? (
              <FieldHint>
                Select a garment type first to load workflow steps.
              </FieldHint>
            ) : null}
            {noStepsConfigured ? (
              <FieldHint className="text-secondary-foreground">
                No active workflow steps are configured for this garment. Add
                and save workflow steps first.
              </FieldHint>
            ) : null}
            {isAdjustMode ? (
              <FieldHint>
                Scope and step are locked. Saving creates a new version of this
                rate card.
              </FieldHint>
            ) : null}
          </FieldStack>

          <FormGrid columns="two" className="gap-4">
            <FieldStack>
              <FieldLabel htmlFor="rate">Rate (Rs.)</FieldLabel>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  className="pl-9"
                  value={formData.amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                />
              </div>
              {fieldErrors.amount ? (
                <FieldError>{fieldErrors.amount}</FieldError>
              ) : null}
            </FieldStack>
            <FieldStack>
              <FieldLabel htmlFor="effectiveFrom">Effective From</FieldLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="effectiveFrom"
                  type="date"
                  className="pl-9"
                  value={formData.effectiveFrom}
                  onChange={(event) => setEffectiveFrom(event.target.value)}
                  required
                />
              </div>
              {fieldErrors.effectiveFrom ? (
                <FieldError>{fieldErrors.effectiveFrom}</FieldError>
              ) : null}
            </FieldStack>
          </FormGrid>
          {formError ? <FieldError>{formError}</FieldError> : null}
        </FormStack>
      </DialogSection>
    </ScrollableDialog>
  );
}
