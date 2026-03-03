"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  type CreateMeasurementCategoryInput,
  type MeasurementCategory,
  type UpdateMeasurementCategoryInput,
} from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import { configApi } from "@/lib/api/config";
import { typedZodResolver } from "@/lib/utils/form";
import { measurementCategorySchema, type MeasurementCategoryFormValues } from "@/types/config";

const EMPTY_VALUES: MeasurementCategoryFormValues = {
  name: "",
  isActive: true,
  sortOrder: 0,
  fields: [],
};

interface UseMeasurementCategoryDialogParams {
  open: boolean;
  initialData?: MeasurementCategory | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function useMeasurementCategoryDialog({
  open,
  initialData,
  onOpenChange,
  onSuccess,
}: UseMeasurementCategoryDialogParams) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<MeasurementCategoryFormValues>({
    resolver: typedZodResolver<MeasurementCategoryFormValues>(measurementCategorySchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(
      initialData
        ? {
            name: initialData.name,
            isActive: initialData.isActive,
            sortOrder: initialData.sortOrder,
            fields: [],
          }
        : EMPTY_VALUES,
    );
  }, [form, initialData, open]);

  const submitCategory = useCallback(
    async (values: MeasurementCategoryFormValues) => {
      setLoading(true);
      try {
        if (initialData) {
          const payload: UpdateMeasurementCategoryInput = {
            name: values.name,
            isActive: values.isActive,
            sortOrder: values.sortOrder,
          };
          await configApi.updateMeasurementCategory(initialData.id, payload);
        } else {
          const payload: CreateMeasurementCategoryInput = {
            name: values.name,
            isActive: values.isActive,
            sortOrder: values.sortOrder,
          };
          await configApi.createMeasurementCategory(payload);
        }

        toast({ title: "Category saved successfully" });
        onSuccess();
        onOpenChange(false);
      } catch {
        toast({
          title: "Error",
          description: "Failed to save category. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [initialData, onOpenChange, onSuccess, toast],
  );

  return {
    form,
    loading,
    submitForm: form.handleSubmit(submitCategory),
  };
}
