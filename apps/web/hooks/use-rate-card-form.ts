"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

export interface RateCardDialogInitialRate {
  garmentTypeId: string;
  branchId?: string | null;
  stepKey: string;
  amount: number;
  effectiveFrom: Date | string;
}

export interface RateFormState {
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

function getAdjustFormData(initialRate: RateCardDialogInitialRate): RateFormState {
  const amountInRupees = initialRate.amount / 100;

  return {
    garmentTypeId: initialRate.garmentTypeId,
    branchId: initialRate.branchId ?? RATE_CARD_GLOBAL_BRANCH_VALUE,
    stepKey: initialRate.stepKey,
    amount: Number.isFinite(amountInRupees) ? String(amountInRupees) : "",
    effectiveFrom: toDateInputValue(initialRate.effectiveFrom),
  };
}

interface UseRateCardFormParams {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRateCardInput) => Promise<void>;
  branches: { id: string; name: string; code: string }[];
  steps?: string[];
  stepsByGarmentTypeId?: Record<string, string[]>;
  mode?: "create" | "adjust";
  initialRate?: RateCardDialogInitialRate | null;
}

export function useRateCardForm({
  open,
  onOpenChange,
  onSubmit,
  branches,
  steps = [],
  stepsByGarmentTypeId,
  mode = "create",
  initialRate = null,
}: UseRateCardFormParams) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RateFormState>(getDefaultFormData);
  const [fieldErrors, setFieldErrors] = useState<RateFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const isAdjustMode = mode === "adjust" && Boolean(initialRate);

  useEffect(() => {
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
  }, [initialRate, isAdjustMode, open]);

  const availableSteps = useMemo(() => {
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
  const branchScopeOptions = useMemo(
    () => buildRateBranchScopeOptions(branches),
    [branches],
  );

  useEffect(() => {
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

  const setBranchId = useCallback((value: string) => {
    setFormData((current) => ({ ...current, branchId: value }));
    setFieldErrors((current) => ({ ...current, branchId: undefined }));
    setFormError(null);
  }, []);

  const setGarmentTypeId = useCallback((value: string) => {
    setFormData((current) => {
      const nextSteps = stepsByGarmentTypeId
        ? (stepsByGarmentTypeId[value] ?? [])
        : steps;

      return {
        ...current,
        garmentTypeId: value,
        stepKey: nextSteps.includes(current.stepKey) ? current.stepKey : "",
      };
    });
    setFieldErrors((current) => ({
      ...current,
      garmentTypeId: undefined,
      stepKey: undefined,
    }));
    setFormError(null);
  }, [steps, stepsByGarmentTypeId]);

  const setStepKey = useCallback((value: string) => {
    setFormData((current) => ({ ...current, stepKey: value }));
    setFieldErrors((current) => ({ ...current, stepKey: undefined }));
    setFormError(null);
  }, []);

  const setAmount = useCallback((value: string) => {
    setFormData((current) => ({
      ...current,
      amount: value,
    }));
    setFieldErrors((current) => ({ ...current, amount: undefined }));
    setFormError(null);
  }, []);

  const setEffectiveFrom = useCallback((value: string) => {
    setFormData((current) => ({
      ...current,
      effectiveFrom: value,
    }));
    setFieldErrors((current) => ({
      ...current,
      effectiveFrom: undefined,
    }));
    setFormError(null);
  }, []);

  const submitForm = useCallback(async () => {
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
    } catch (error) {
      logDevError("Failed to save rate card:", error);
    } finally {
      setLoading(false);
    }
  }, [formData, onOpenChange, onSubmit]);

  return {
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
  };
}
