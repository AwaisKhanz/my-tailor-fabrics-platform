"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FieldType,
  measurementFieldDialogFormSchema,
  type MeasurementFieldDialogFormValues,
  type MeasurementField,
  type MeasurementSection,
  type CreateMeasurementFieldInput,
  type UpdateMeasurementFieldInput,
} from "@tbms/shared-types";
import { configApi } from "@/lib/api/config";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";
import { typedZodResolver } from "@/lib/utils/form";

export type FieldFormValues = MeasurementFieldDialogFormValues;

interface UseMeasurementFieldDialogParams {
  open: boolean;
  categoryId: string;
  initialData?: MeasurementField | null;
  existingFields: MeasurementField[];
  existingSections: MeasurementSection[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DEFAULT_FORM_VALUES: FieldFormValues = {
  label: "",
  sectionName: "",
  fieldType: FieldType.NUMBER,
  unit: "",
  isRequired: false,
  dropdownOptions: [],
  sortOrder: 1,
};

export function useMeasurementFieldDialog({
  open,
  categoryId,
  initialData,
  existingFields,
  existingSections,
  onOpenChange,
  onSuccess,
}: UseMeasurementFieldDialogParams) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newOption, setNewOption] = useState("");

  const form = useForm<FieldFormValues>({
    resolver: typedZodResolver<FieldFormValues>(measurementFieldDialogFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const fieldType = form.watch("fieldType");
  const dropdownOptions = form.watch("dropdownOptions");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialData) {
      form.reset({
        label: initialData.label ?? "",
        sectionName: initialData.section?.name ?? "General",
        fieldType: initialData.fieldType ?? FieldType.NUMBER,
        unit: initialData.unit ?? "",
        isRequired: initialData.isRequired ?? false,
        dropdownOptions: initialData.dropdownOptions ?? [],
        sortOrder: initialData.sortOrder ?? 1,
      });
    } else {
      form.reset({
        ...DEFAULT_FORM_VALUES,
        sectionName: existingSections[0]?.name ?? "General",
        sortOrder: (existingFields.length ?? 0) + 1,
      });
    }

    setNewOption("");
  }, [existingFields.length, existingSections, form, initialData, open]);

  const addOption = useCallback(() => {
    const trimmedOption = newOption.trim();
    if (!trimmedOption) {
      return;
    }

    const currentOptions = form.getValues("dropdownOptions");
    if (!currentOptions.includes(trimmedOption)) {
      form.setValue("dropdownOptions", [...currentOptions, trimmedOption]);
    }

    setNewOption("");
  }, [form, newOption]);

  const removeOption = useCallback(
    (optionToRemove: string) => {
      const currentOptions = form.getValues("dropdownOptions");
      form.setValue(
        "dropdownOptions",
        currentOptions.filter((option) => option !== optionToRemove),
      );
    },
    [form],
  );

  const handleSubmit = useCallback(
    async (values: FieldFormValues) => {
      const normalizedLabel = values.label.trim().toLowerCase();
      const isDuplicate = existingFields.some(
        (field) => field.label.trim().toLowerCase() === normalizedLabel && field.id !== initialData?.id,
      );

      if (isDuplicate) {
        form.setError("label", {
          type: "manual",
          message: "A field with this name already exists in this category.",
        });
        return;
      }

      const parsedResult = measurementFieldDialogFormSchema.safeParse(values);
      if (!parsedResult.success) {
        toast({
          title: "Validation error",
          description: getFirstZodErrorMessage(parsedResult.error),
          variant: "destructive",
        });
        return;
      }
      const validated = parsedResult.data;

      setLoading(true);
      try {
        const basePayload = {
          ...validated,
          sectionName: validated.sectionName.trim(),
          unit: validated.unit || undefined,
          dropdownOptions:
            validated.fieldType === FieldType.DROPDOWN
              ? validated.dropdownOptions
              : undefined,
        };

        if (initialData?.id) {
          const payload: UpdateMeasurementFieldInput = basePayload;
          await configApi.updateMeasurementField(initialData.id, payload);
          toast({ title: "Field updated successfully" });
        } else {
          const payload: CreateMeasurementFieldInput = basePayload;
          await configApi.addMeasurementField(categoryId, payload);
          toast({ title: "Field added successfully" });
        }

        onSuccess();
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(error, "Failed to save field. Please try again."),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [categoryId, existingFields, form, initialData?.id, onOpenChange, onSuccess, toast],
  );

  return {
    form,
    loading,
    fieldType,
    dropdownOptions,
    newOption,
    setNewOption,
    addOption,
    removeOption,
    submitForm: form.handleSubmit(handleSubmit),
  };
}
