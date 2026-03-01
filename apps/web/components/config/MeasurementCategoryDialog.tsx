"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { configApi } from "@/lib/api/config";
import { typedZodResolver } from "@/lib/utils/form";
import { measurementCategorySchema, MeasurementCategoryFormValues, CreateMeasurementCategoryInput, UpdateMeasurementCategoryInput } from "@/types/config";
import type { MeasurementCategory } from "@/types/config";

interface MeasurementCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: MeasurementCategory | null;
  onSuccess: () => void;
}

const EMPTY_VALUES: MeasurementCategoryFormValues = {
  name: "",
  isActive: true,
  sortOrder: 0,
  fields: [],
};

export function MeasurementCategoryDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: MeasurementCategoryDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<MeasurementCategoryFormValues>({
    resolver: typedZodResolver<MeasurementCategoryFormValues>(measurementCategorySchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        initialData
          ? {
              name: initialData.name,
              isActive: initialData.isActive,
              sortOrder: initialData.sortOrder,
              fields: [],
            }
          : EMPTY_VALUES
      );
    }
  }, [initialData, form, open]);

  async function onSubmit(values: MeasurementCategoryFormValues) {
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
  }

  const footerActions = (
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button type="submit" form="category-form" variant="premium" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Category
      </Button>
    </div>
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Category" : "Add Measurement Category"}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-md"
    >
      <Form {...form}>
        <form
          id="category-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 px-1 pb-2"
        >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input variant="premium" placeholder="e.g. Mens Shirt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
        </form>
      </Form>
    </ScrollableDialog>
  );
}
