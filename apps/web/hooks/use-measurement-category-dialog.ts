"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  type CreateMeasurementCategoryInput,
  type MeasurementCategory,
  type UpdateMeasurementCategoryInput,
} from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateMeasurementCategory,
  useUpdateMeasurementCategory,
} from "@/hooks/queries/config-queries";
import { typedZodResolver } from "@/lib/utils/form";
import {
  measurementCategorySchema,
  type MeasurementCategoryFormValues,
} from "@/types/config";

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
  const createMeasurementCategoryMutation = useCreateMeasurementCategory();
  const updateMeasurementCategoryMutation = useUpdateMeasurementCategory();
  const loading =
    createMeasurementCategoryMutation.isPending ||
    updateMeasurementCategoryMutation.isPending;

  const form = useForm<MeasurementCategoryFormValues>({
    resolver: typedZodResolver(measurementCategorySchema),
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
      try {
        if (initialData) {
          const payload: UpdateMeasurementCategoryInput = {
            name: values.name,
            isActive: values.isActive,
            sortOrder: values.sortOrder,
          };
          await updateMeasurementCategoryMutation.mutateAsync({
            id: initialData.id,
            data: payload,
          });
        } else {
          const payload: CreateMeasurementCategoryInput = {
            name: values.name,
            isActive: values.isActive,
            sortOrder: values.sortOrder,
          };
          await createMeasurementCategoryMutation.mutateAsync(payload);
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
      }
    },
    [
      createMeasurementCategoryMutation,
      initialData,
      onOpenChange,
      onSuccess,
      toast,
      updateMeasurementCategoryMutation,
    ],
  );

  return {
    form,
    loading,
    submitForm: form.handleSubmit(submitCategory),
  };
}
