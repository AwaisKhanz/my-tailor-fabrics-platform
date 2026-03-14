"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  designTypeFormSchema,
  type DesignType,
  type CreateDesignTypeInput,
  type DesignTypeFormValues,
  type UpdateDesignTypeInput,
} from "@tbms/shared-types";
import { typedZodResolver } from "@/lib/utils/form";

export const DESIGN_TYPE_ALL_SCOPE = "ALL";
export const DESIGN_TYPE_ALL_GARMENTS_LABEL = "All Garments";
export const DESIGN_TYPE_GLOBAL_BRANCH_SCOPE_LABEL = "Global (All Branches)";

export type { DesignTypeFormValues };

interface UseDesignTypeDialogParams {
  open: boolean;
  initialData?: DesignType | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: DesignTypeSubmitPayload) => Promise<void>;
  garmentTypes: { id: string; name: string }[];
  branches: { id: string; name: string; code: string }[];
}

export type DesignTypeSubmitPayload =
  | { mode: "create"; data: CreateDesignTypeInput }
  | { mode: "update"; data: UpdateDesignTypeInput };

const DEFAULT_VALUES: DesignTypeFormValues = {
  name: "",
  defaultPrice: 0,
  defaultRate: 0,
  garmentTypeId: DESIGN_TYPE_ALL_SCOPE,
  branchId: DESIGN_TYPE_ALL_SCOPE,
  sortOrder: 0,
  isActive: true,
};

export function useDesignTypeDialog({
  open,
  initialData,
  onOpenChange,
  onSubmit,
  garmentTypes,
  branches,
}: UseDesignTypeDialogParams) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<DesignTypeFormValues>({
    resolver: typedZodResolver(designTypeFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialData) {
      form.reset({
        name: initialData.name,
        defaultPrice: initialData.defaultPrice / 100,
        defaultRate: initialData.defaultRate / 100,
        garmentTypeId: initialData.garmentTypeId || DESIGN_TYPE_ALL_SCOPE,
        branchId: initialData.branchId || DESIGN_TYPE_ALL_SCOPE,
        sortOrder: initialData.sortOrder ?? 0,
        isActive: initialData.isActive ?? true,
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [form, initialData, open]);

  const submitDesignType = useCallback(
    async (values: DesignTypeFormValues) => {
      setSubmitting(true);
      try {
        const basePayload = {
          name: values.name,
          defaultPrice: values.defaultPrice,
          defaultRate: values.defaultRate,
          sortOrder: values.sortOrder,
          isActive: values.isActive,
        };

        if (initialData) {
          const updatePayload: UpdateDesignTypeInput = {
            ...basePayload,
            garmentTypeId:
              values.garmentTypeId === DESIGN_TYPE_ALL_SCOPE
                ? null
                : values.garmentTypeId,
            branchId:
              values.branchId === DESIGN_TYPE_ALL_SCOPE ? null : values.branchId,
          };
          await onSubmit({ mode: "update", data: updatePayload });
        } else {
          const createPayload: CreateDesignTypeInput = {
            ...basePayload,
            garmentTypeId:
              values.garmentTypeId === DESIGN_TYPE_ALL_SCOPE
                ? null
                : values.garmentTypeId,
            branchId:
              values.branchId === DESIGN_TYPE_ALL_SCOPE ? null : values.branchId,
          };
          await onSubmit({ mode: "create", data: createPayload });
        }
        onOpenChange(false);
      } finally {
        setSubmitting(false);
      }
    },
    [initialData, onOpenChange, onSubmit],
  );

  const garmentScopeOptions = useMemo(
    () => [
      {
        value: DESIGN_TYPE_ALL_SCOPE,
        label: DESIGN_TYPE_ALL_GARMENTS_LABEL,
      },
      ...garmentTypes.map((garmentType) => ({
        value: garmentType.id,
        label: garmentType.name,
      })),
    ],
    [garmentTypes],
  );

  const branchScopeOptions = useMemo(
    () => [
      {
        value: DESIGN_TYPE_ALL_SCOPE,
        label: DESIGN_TYPE_GLOBAL_BRANCH_SCOPE_LABEL,
      },
      ...branches.map((branch) => ({
        value: branch.id,
        label: `${branch.name} (${branch.code})`,
      })),
    ],
    [branches],
  );

  return {
    form,
    submitting,
    garmentScopeOptions,
    branchScopeOptions,
    submitForm: form.handleSubmit(submitDesignType),
  };
}
