"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type DesignType } from "@tbms/shared-types";

export const DESIGN_TYPE_ALL_SCOPE = "ALL";

export interface DesignTypeFormValues {
  name: string;
  defaultPrice: number;
  defaultRate: number;
  garmentTypeId: string;
  branchId: string;
  sortOrder: number;
  isActive: boolean;
}

interface UseDesignTypeDialogParams {
  open: boolean;
  initialData?: DesignType | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<DesignType>) => Promise<void>;
}

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
        const payload: Partial<DesignType> = {
          ...values,
          garmentTypeId:
            values.garmentTypeId === DESIGN_TYPE_ALL_SCOPE ? null : values.garmentTypeId,
          branchId: values.branchId === DESIGN_TYPE_ALL_SCOPE ? null : values.branchId,
          defaultPrice: Number(values.defaultPrice),
          defaultRate: Number(values.defaultRate),
          sortOrder: Number(values.sortOrder),
        };

        await onSubmit(payload);
        onOpenChange(false);
      } finally {
        setSubmitting(false);
      }
    },
    [onOpenChange, onSubmit],
  );

  return {
    form,
    submitting,
    submitForm: form.handleSubmit(submitDesignType),
  };
}
