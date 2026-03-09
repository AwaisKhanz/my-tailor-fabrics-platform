"use client";

import {
  DialogFormActions,
  DialogSection,
  FormStack,
} from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
          <div className="space-y-2">
            <Label htmlFor="branch">Branch Scope</Label>
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
              <p className="text-xs text-destructive">{fieldErrors.branchId}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="garmentType">Garment Type</Label>
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
              <p className="text-xs text-destructive">{fieldErrors.garmentTypeId}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepKey">Production Step</Label>
            <Select
              value={formData.stepKey}
              onValueChange={setStepKey}
              disabled={isAdjustMode || !hasGarmentSelected || !hasAvailableSteps}
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
              <p className="text-xs text-destructive">{fieldErrors.stepKey}</p>
            ) : null}
            {!hasGarmentSelected ? (
              <p className="text-xs text-muted-foreground">
                Select a garment type first to load workflow steps.
              </p>
            ) : null}
            {noStepsConfigured ? (
              <p className="text-xs text-secondary-foreground">
                No active workflow steps are configured for this garment. Add
                and save workflow steps first.
              </p>
            ) : null}
            {isAdjustMode ? (
              <p className="text-xs text-muted-foreground">
                Scope and step are locked. Saving creates a new version of this
                rate card.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Rate (Rs.)</Label>
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
                <p className="text-xs text-destructive">{fieldErrors.amount}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveFrom">Effective From</Label>
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
                <p className="text-xs text-destructive">{fieldErrors.effectiveFrom}</p>
              ) : null}
            </div>
          </div>
          {formError ? (
            <p className="text-xs text-destructive">{formError}</p>
          ) : null}
        </FormStack>
      </DialogSection>
    </ScrollableDialog>
  );
}
