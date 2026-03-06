"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createMeasurementValuesFormSchema,
  type MeasurementCategory,
  type MeasurementValues,
  FieldType,
} from "@tbms/shared-types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormActionRow, FormStack } from "@/components/ui/form-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { customerApi } from "@/lib/api/customers";
import { configApi } from "@/lib/api/config";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { logDevError } from "@/lib/logger";
import { Card } from "../ui/card";

interface MeasurementFormProps {
  customerId: string;
  onSuccess: () => void;
  initialCategoryId?: string;
  initialValues?: MeasurementValues;
}

export function MeasurementForm({
  customerId,
  onSuccess,
  initialCategoryId,
  initialValues,
}: MeasurementFormProps) {
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

  const groupedFields = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    const groups = new Map<
      string,
      {
        id: string;
        name: string;
        sortOrder: number;
        fields: typeof selectedCategory.fields;
      }
    >();

    (selectedCategory.sections || []).forEach((section) => {
      groups.set(section.id, {
        id: section.id,
        name: section.name,
        sortOrder: section.sortOrder,
        fields: [],
      });
    });

    const FALLBACK_SECTION_ID = "__general__";
    if (!groups.has(FALLBACK_SECTION_ID)) {
      groups.set(FALLBACK_SECTION_ID, {
        id: FALLBACK_SECTION_ID,
        name: "General",
        sortOrder: Number.MAX_SAFE_INTEGER,
        fields: [],
      });
    }

    selectedCategory.fields.forEach((field) => {
      const targetKey =
        field.sectionId && groups.has(field.sectionId)
          ? field.sectionId
          : FALLBACK_SECTION_ID;
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
            const cat = categoriesData.find((c) => c.id === initialCategoryId);
            if (cat) setSelectedCategory(cat);
          }
        }
      } catch (error) {
        logDevError("Failed to load measurement categories:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, [initialCategoryId]);

  const handleCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (cat) {
      setSelectedCategory(cat);
      form.clearErrors();
      if (categoryId === initialCategoryId) {
        form.reset(initialValues || {});
      } else {
        form.reset({});
      }
    }
  };

  async function onSubmit(values: MeasurementValues) {
    if (!selectedCategory || !measurementValuesSchema) return;

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

  if (loading)
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
      </div>
    );

  return (
    <FormStack density="relaxed">
      <div className="space-y-2">
        <Label variant="dashboard">Measurement Category</Label>
        <Select
          onValueChange={handleCategoryChange}
          defaultValue={initialCategoryId}
        >
          <SelectTrigger variant="premium">
            <SelectValue placeholder="Select Garment Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCategory && (
        <Card variant="default">
          <Form {...form}>
            <FormStack as="form" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {groupedFields.map((section) => (
                  <div key={section.id} className="p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-text-primary">
                        {section.name}
                      </h3>
                      <span className="text-xs text-text-secondary">
                        {section.fields.length} field
                        {section.fields.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {section.fields.map((field) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={field.id}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel variant="dashboard">
                                {field.label}{" "}
                                {field.unit && (
                                  <span className="text-xs text-text-secondary">
                                    ({field.unit})
                                  </span>
                                )}
                                {field.isRequired && (
                                  <span className="text-destructive">*</span>
                                )}
                              </FormLabel>
                              <FormControl>
                                {field.fieldType === FieldType.DROPDOWN ? (
                                  <Select
                                    onValueChange={formField.onChange}
                                    value={
                                      typeof formField.value === "string"
                                        ? formField.value
                                        : ""
                                    }
                                  >
                                    <SelectTrigger variant="premium">
                                      <SelectValue
                                        placeholder={`Select ${field.label}`}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.dropdownOptions.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    variant="premium"
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    type={
                                      field.fieldType === FieldType.NUMBER
                                        ? "text"
                                        : "text"
                                    }
                                    {...formField}
                                    value={
                                      typeof formField.value === "string" ||
                                      typeof formField.value === "number"
                                        ? formField.value
                                        : ""
                                    }
                                  />
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <FormActionRow>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Measurements"}
                </Button>
              </FormActionRow>
            </FormStack>
          </Form>
        </Card>
      )}
    </FormStack>
  );
}
