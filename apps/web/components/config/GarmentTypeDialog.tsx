"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { DialogFormActions, FormStack } from "@tbms/ui/components/form-layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { Input } from "@tbms/ui/components/input";
import { Switch } from "@tbms/ui/components/switch";
import { MultiSelect } from "@tbms/ui/components/multi-select";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { Textarea } from "@tbms/ui/components/textarea";
import { Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateGarmentType,
  useMeasurementCategories,
  useUpdateGarmentType,
} from "@/hooks/queries/config-queries";
import { typedZodResolver } from "@/lib/utils/form";
import {
  garmentTypeSchema,
  GarmentTypeFormValues,
} from "@/types/config/schemas";
import type {
  CreateGarmentTypeInput,
  GarmentType,
  MeasurementCategory,
  UpdateGarmentTypeInput,
} from "@tbms/shared-types";
import { logDevError } from "@/lib/logger";

interface GarmentTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: GarmentType | null;
  onSuccess: () => void;
}

export function GarmentTypeDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: GarmentTypeDialogProps) {
  const { toast } = useToast();
  const createGarmentTypeMutation = useCreateGarmentType();
  const updateGarmentTypeMutation = useUpdateGarmentType();
  const measurementCategoriesQuery = useMeasurementCategories({ limit: 100 });
  const loading =
    createGarmentTypeMutation.isPending || updateGarmentTypeMutation.isPending;
  const categories: MeasurementCategory[] = measurementCategoriesQuery.data
    ?.success
    ? measurementCategoriesQuery.data.data.data
    : [];

  useEffect(() => {
    if (!open || !measurementCategoriesQuery.isError) {
      return;
    }

    logDevError(
      "Failed to fetch categories:",
      measurementCategoriesQuery.error,
    );
  }, [
    measurementCategoriesQuery.error,
    measurementCategoriesQuery.isError,
    open,
  ]);

  const form = useForm<GarmentTypeFormValues>({
    resolver: typedZodResolver(garmentTypeSchema),
    defaultValues: {
      name: "",
      customerPrice: 0,
      description: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? "",
        customerPrice: initialData.customerPrice / 100,
        sortOrder: initialData.sortOrder,
        isActive: initialData.isActive,
        measurementCategoryIds:
          initialData.measurementCategories?.map((category) => category.id) ??
          [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        customerPrice: 0,
        sortOrder: 0,
        isActive: true,
        measurementCategoryIds: [],
      });
    }
  }, [initialData, form, open]);

  async function onSubmit(data: GarmentTypeFormValues) {
    try {
      const normalizedPayload = { ...data };

      if (initialData) {
        const payload: UpdateGarmentTypeInput = normalizedPayload;
        await updateGarmentTypeMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        });
      } else {
        const payload: CreateGarmentTypeInput = normalizedPayload;
        await createGarmentTypeMutation.mutateAsync(payload);
      }

      toast({
        title: "Success",
        description: "Garment updated successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      logDevError("Failed to save garment type:", error);
      toast({
        title: "Error",
        description: "Failed to save garment type",
        variant: "destructive",
      });
    }
  }

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Garment Type" : "Add Garment Type"}
      description="Configure garment pricing and linked measurement forms."
      contentSize="2xl"
      maxWidthClass=""
      footerActions={
        <DialogFormActions
          onCancel={() => onOpenChange(false)}
          submitText={initialData ? "Save Changes" : "Create Garment Type"}
          submittingText="Saving Garment..."
          submitting={loading}
          submitFormId="garment-type-form"
        />
      }
    >
      <Form {...form}>
        <FormStack
          as="form"
          id="garment-type-form"
          onSubmit={form.handleSubmit(onSubmit)}
          density="default"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
                <FormItem>
                  <FormLabel>Garment Name</FormLabel>
                  <FormControl>
                    <Input
                      className="h-9 text-sm"
                      placeholder="e.g. Mens Shirt"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[92px] text-sm"
                      placeholder="e.g. Standard fitting"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="customerPrice"
              render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
                <FormItem>
                  <FormLabel>Price (Rs)</FormLabel>
                  <FormControl>
                    <Input className="h-9" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Measurement Categories
              </p>
            </div>
            <FormField
              control={form.control}
              name="measurementCategoryIds"
              render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
                <FormItem>
                  <FormControl>
                    <MultiSelect
                      className="min-h-9 py-1 text-sm pt-1.5"
                      options={categories.map((c) => ({
                        label: c.name,
                        value: c.id,
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select connected forms..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-2">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
                <FormItem>
                  <div className="flex h-[38px] items-center justify-between rounded-md bg-muted/40 px-2.5">
                    <FormLabel className="cursor-pointer m-0">Active</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </FormStack>
      </Form>
    </ScrollableDialog>
  );
}
