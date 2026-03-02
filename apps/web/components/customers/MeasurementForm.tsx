"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  customerApi,
} from "@/lib/api/customers";
import { configApi } from "@/lib/api/config";
import { MeasurementCategory } from "@/types/config";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface MeasurementFormProps {
  customerId: string;
  onSuccess: () => void;
  initialCategoryId?: string;
  initialValues?: Record<string, unknown>;
}

export function MeasurementForm({
  customerId,
  onSuccess,
  initialCategoryId,
  initialValues,
}: MeasurementFormProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<MeasurementCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MeasurementCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    defaultValues: initialValues || {},
  });

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
        console.error("Failed to load categories:", error);
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
      if (categoryId === initialCategoryId) {
        form.reset(initialValues || {});
      } else {
        form.reset({});
      }
    }
  };

  async function onSubmit(values: Record<string, unknown>) {
    if (!selectedCategory) return;
    setSubmitting(true);
    try {
      await customerApi.upsertMeasurements(customerId, selectedCategory.id, values);
      toast({ title: "Measurements saved successfully" });
      onSuccess();
    } catch (error) {
      console.error("Failed to save measurements:", error);
      toast({
        title: "Error",
        description: "Failed to save measurements.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Measurement Category</label>
        <Select onValueChange={handleCategoryChange} defaultValue={initialCategoryId}>
          <SelectTrigger>
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCategory.fields.sort((a, b) => a.sortOrder - b.sortOrder).map((field) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={field.id}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>
                        {field.label} {field.unit && <span className="text-xs text-muted-foreground">({field.unit})</span>}
                        {field.isRequired && <span className="text-destructive">*</span>}
                      </FormLabel>
                      <FormControl>
                        {field.fieldType === "DROPDOWN" ? (
                          <Select 
                            onValueChange={formField.onChange} 
                            defaultValue={formField.value as string}
                            value={formField.value as string}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${field.label}`} />
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
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            type={field.fieldType === "NUMBER" ? "text" : "text"}
                            {...formField}
                            value={(formField.value as string | number) ?? ""}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Measurements"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
