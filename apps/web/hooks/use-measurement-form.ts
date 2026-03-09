"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createMeasurementValuesFormSchema,
  type MeasurementCategory,
  type MeasurementValues,
  FieldType,
} from "@tbms/shared-types";
import { customerApi } from "@/lib/api/customers";
import { configApi } from "@/lib/api/config";
import { logDevError } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

interface UseMeasurementFormParams {
  customerId: string;
  onSuccess: () => void;
  initialCategoryId?: string;
  initialValues?: MeasurementValues;
}

type MeasurementField = MeasurementCategory["fields"][number];

export interface MeasurementFieldGroup {
  id: string;
  name: string;
  sortOrder: number;
  fields: MeasurementField[];
}

export function useMeasurementForm({
  customerId,
  onSuccess,
  initialCategoryId,
  initialValues,
}: UseMeasurementFormParams) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<MeasurementCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<MeasurementCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MeasurementValues>({
    defaultValues: initialValues ?? {},
  });

  const measurementValuesSchema = useMemo(
    () =>
      selectedCategory
        ? createMeasurementValuesFormSchema(selectedCategory.fields)
        : null,
    [selectedCategory],
  );

  const groupedFields = useMemo<MeasurementFieldGroup[]>(() => {
    if (!selectedCategory) {
      return [];
    }

    const groups = new Map<string, MeasurementFieldGroup>();

    (selectedCategory.sections || []).forEach((section) => {
      groups.set(section.id, {
        id: section.id,
        name: section.name,
        sortOrder: section.sortOrder,
        fields: [],
      });
    });

    const fallbackSectionId = "__general__";
    if (!groups.has(fallbackSectionId)) {
      groups.set(fallbackSectionId, {
        id: fallbackSectionId,
        name: "General",
        sortOrder: Number.MAX_SAFE_INTEGER,
        fields: [],
      });
    }

    selectedCategory.fields.forEach((field) => {
      const targetKey =
        field.sectionId && groups.has(field.sectionId)
          ? field.sectionId
          : fallbackSectionId;
      groups.get(targetKey)?.fields.push(field);
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        fields: [...group.fields].sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .filter((group) => group.fields.length > 0)
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }

        return a.name.localeCompare(b.name);
      });
  }, [selectedCategory]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await configApi.getMeasurementCategories();
        if (response.success && response.data?.data) {
          const categoriesData = response.data.data;
          setCategories(categoriesData);
          if (initialCategoryId) {
            const category = categoriesData.find(
              (item) => item.id === initialCategoryId,
            );
            if (category) {
              setSelectedCategory(category);
            }
          }
        }
      } catch (error) {
        logDevError("Failed to load measurement categories:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadCategories();
  }, [initialCategoryId]);

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId);
    if (!category) {
      return;
    }

    setSelectedCategory(category);
    form.clearErrors();
    if (categoryId === initialCategoryId) {
      form.reset(initialValues || {});
      return;
    }

    form.reset({});
  };

  async function onSubmit(values: MeasurementValues) {
    if (!selectedCategory || !measurementValuesSchema) {
      return;
    }

    const parsedResult = measurementValuesSchema.safeParse(values);
    if (!parsedResult.success) {
      parsedResult.error.issues.forEach((issue) => {
        const fieldId = issue.path[0];
        if (typeof fieldId !== "string") {
          return;
        }

        form.setError(fieldId, {
          type: "manual",
          message: issue.message,
        });
      });

      return;
    }

    setSubmitting(true);
    try {
      const fieldById = new Map(
        selectedCategory.fields.map((field) => [field.id, field]),
      );
      const sanitizedValues: MeasurementValues = {};

      Object.entries(parsedResult.data).forEach(([key, value]) => {
        if (value === undefined) {
          return;
        }

        if (typeof value === "string") {
          const trimmedValue = value.trim();
          if (trimmedValue.length === 0) {
            return;
          }

          const field = fieldById.get(key);
          if (field?.fieldType === FieldType.NUMBER) {
            const parsedNumber = Number(trimmedValue);
            if (Number.isFinite(parsedNumber)) {
              sanitizedValues[key] = parsedNumber;
              return;
            }
          }

          sanitizedValues[key] = trimmedValue;
          return;
        }

        sanitizedValues[key] = value;
      });

      await customerApi.upsertMeasurements(
        customerId,
        selectedCategory.id,
        sanitizedValues,
      );
      toast({ title: "Measurements saved successfully" });
      onSuccess();
    } catch (error) {
      logDevError("Failed to save measurements:", error);
      toast({
        title: "Error",
        description: "Failed to save measurements.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return {
    form,
    categories,
    selectedCategory,
    loading,
    submitting,
    groupedFields,
    handleCategoryChange,
    onSubmit,
  };
}
