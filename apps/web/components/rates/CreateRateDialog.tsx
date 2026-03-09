"use client";

import React from "react";
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
import {
  rateCardCreateFormSchema,
  type CreateRateCardInput,
} from "@tbms/shared-types";
import {
  buildRateBranchScopeOptions,
  RATE_CARD_GLOBAL_BRANCH_VALUE,
} from "@/lib/rates";
import { logDevError } from "@/lib/logger";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

interface CreateRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRateCardInput) => Promise<void>;
  garmentTypes: { id: string; name: string }[];
  branches: { id: string; name: string; code: string }[];
  steps?: string[];
  stepsByGarmentTypeId?: Record<string, string[]>;
  mode?: "create" | "adjust";
  initialRate?: {
    garmentTypeId: string;
    branchId?: string | null;
    stepKey: string;
    amount: number;
    effectiveFrom: Date | string;
  } | null;
}

interface RateFormState {
  garmentTypeId: string;
  branchId: string;
  stepKey: string;
  amount: string;
  effectiveFrom: string;
}

type RateFieldErrors = Partial<Record<keyof RateFormState, string>>;

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateInputValue(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return toLocalDateString(new Date());
  }

  return toLocalDateString(parsed);
}

function getDefaultFormData(): RateFormState {
  return {
    garmentTypeId: "",
    branchId: RATE_CARD_GLOBAL_BRANCH_VALUE,
    stepKey: "",
    amount: "",
    effectiveFrom: toLocalDateString(new Date()),
  };
}

function getAdjustFormData(
  initialRate: NonNullable<CreateRateDialogProps["initialRate"]>,
): RateFormState {
  const amountInRupees = initialRate.amount / 100;

  return {
    garmentTypeId: initialRate.garmentTypeId,
    branchId: initialRate.branchId ?? RATE_CARD_GLOBAL_BRANCH_VALUE,
    stepKey: initialRate.stepKey,
    amount: Number.isFinite(amountInRupees) ? String(amountInRupees) : "",
    effectiveFrom: toDateInputValue(initialRate.effectiveFrom),
  };
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
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<RateFormState>(getDefaultFormData);
  const [fieldErrors, setFieldErrors] = React.useState<RateFieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const isAdjustMode = mode === "adjust" && Boolean(initialRate);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    if (isAdjustMode && initialRate) {
      setFormData(getAdjustFormData(initialRate));
      setFieldErrors({});
      setFormError(null);
      return;
    }

    setFormData(getDefaultFormData());
    setFieldErrors({});
    setFormError(null);
  }, [open, isAdjustMode, initialRate]);

  const availableSteps = React.useMemo(() => {
    let resolvedSteps: string[] = [];

    if (stepsByGarmentTypeId) {
      if (!formData.garmentTypeId) {
        return [];
      }

      resolvedSteps = stepsByGarmentTypeId[formData.garmentTypeId] ?? [];
    } else {
      resolvedSteps = steps;
    }

    if (
      isAdjustMode &&
      formData.stepKey &&
      !resolvedSteps.includes(formData.stepKey)
    ) {
      return [formData.stepKey, ...resolvedSteps];
    }

    return resolvedSteps;
  }, [
    formData.garmentTypeId,
    formData.stepKey,
    isAdjustMode,
    steps,
    stepsByGarmentTypeId,
  ]);

  const hasGarmentSelected = Boolean(formData.garmentTypeId);
  const hasAvailableSteps = availableSteps.length > 0;
  const noStepsConfigured =
    !isAdjustMode && hasGarmentSelected && !hasAvailableSteps;
  const branchScopeOptions = React.useMemo(
    () => buildRateBranchScopeOptions(branches),
    [branches],
  );

  React.useEffect(() => {
    if (isAdjustMode || !formData.stepKey) {
      return;
    }

    if (!availableSteps.includes(formData.stepKey)) {
      setFormData((current) => ({
        ...current,
        stepKey: "",
      }));
    }
  }, [availableSteps, formData.stepKey, isAdjustMode]);

  const handleSubmit = async () => {
    const parsedResult = rateCardCreateFormSchema.safeParse(formData);
    if (!parsedResult.success) {
      const zodFieldErrors = parsedResult.error.flatten().fieldErrors;
      setFieldErrors({
        garmentTypeId: zodFieldErrors.garmentTypeId?.[0],
        branchId: zodFieldErrors.branchId?.[0],
        stepKey: zodFieldErrors.stepKey?.[0],
        amount: zodFieldErrors.amount?.[0],
        effectiveFrom: zodFieldErrors.effectiveFrom?.[0],
      });
      setFormError(getFirstZodErrorMessage(parsedResult.error));
      return;
    }
    setFieldErrors({});
    setFormError(null);

    const validated = parsedResult.data;
    const effectiveFrom =
      DATE_ONLY_PATTERN.test(validated.effectiveFrom) &&
      validated.effectiveFrom === toLocalDateString(new Date())
        ? new Date().toISOString()
        : validated.effectiveFrom;

    setLoading(true);
    try {
      await onSubmit({
        garmentTypeId: validated.garmentTypeId,
        stepKey: validated.stepKey,
        effectiveFrom,
        branchId:
          validated.branchId === RATE_CARD_GLOBAL_BRANCH_VALUE
            ? null
            : validated.branchId,
        amount: validated.amount,
      });
      onOpenChange(false);
    } catch (err) {
      logDevError("Failed to save rate card:", err);
    } finally {
      setLoading(false);
    }
  };

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
            void handleSubmit();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="branch">Branch Scope</Label>
            <Select
              value={formData.branchId}
              onValueChange={(value) => {
                setFormData((current) => ({ ...current, branchId: value }));
                setFieldErrors((current) => ({ ...current, branchId: undefined }));
                setFormError(null);
              }}
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
              onValueChange={(value) => {
                setFormData((current) => {
                  const nextSteps = stepsByGarmentTypeId
                    ? (stepsByGarmentTypeId[value] ?? [])
                    : steps;

                  return {
                    ...current,
                    garmentTypeId: value,
                    stepKey: nextSteps.includes(current.stepKey)
                      ? current.stepKey
                      : "",
                  };
                });
                setFieldErrors((current) => ({
                  ...current,
                  garmentTypeId: undefined,
                  stepKey: undefined,
                }));
                setFormError(null);
              }}
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
              onValueChange={(value) => {
                setFormData((current) => ({ ...current, stepKey: value }));
                setFieldErrors((current) => ({ ...current, stepKey: undefined }));
                setFormError(null);
              }}
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
                  onChange={(event) => {
                    setFormData((current) => ({
                      ...current,
                      amount: event.target.value,
                    }));
                    setFieldErrors((current) => ({ ...current, amount: undefined }));
                    setFormError(null);
                  }}
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
                  onChange={(event) => {
                    setFormData((current) => ({
                      ...current,
                      effectiveFrom: event.target.value,
                    }));
                    setFieldErrors((current) => ({
                      ...current,
                      effectiveFrom: undefined,
                    }));
                    setFormError(null);
                  }}
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
