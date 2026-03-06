"use client";

import { useCallback, useEffect, useState } from "react";
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

export type { DesignTypeFormValues };

interface UseDesignTypeDialogParams {
  open: boolean;
  initialData?: DesignType | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: DesignTypeSubmitPayload) => Promise<void>;
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
        defaultPrice: initialData.defaultPrice,
        defaultRate: initialData.defaultRate,
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
          const updatePayload: UpdateDesignTypeInput = basePayload;
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

  return {
    form,
    submitting,
    submitForm: form.handleSubmit(submitDesignType),
  };
}
