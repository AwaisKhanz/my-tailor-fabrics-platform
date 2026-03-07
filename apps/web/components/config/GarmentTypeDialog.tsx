"use client";

import React, { useEffect } from "react";
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
import { DialogFormActions, FormStack } from "@/components/ui/form-layout";
import { InfoTile } from "@/components/ui/info-tile";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { configApi } from "@/lib/api/config";
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
  const [loading, setLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<MeasurementCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const resp = await configApi.getMeasurementCategories({ limit: 100 });
        if (resp?.data) {
          setCategories(resp.data.data);
        }
      } catch (err) {
        logDevError("Failed to fetch categories:", err);
      }
    };
    if (open) fetchCategories();
  }, [open]);

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
    setLoading(true);
    try {
      const normalizedPayload = { ...data };

      if (initialData) {
        const payload: UpdateGarmentTypeInput = normalizedPayload;
        await configApi.updateGarmentType(initialData.id, payload);
      } else {
        const payload: CreateGarmentTypeInput = normalizedPayload;
        await configApi.createGarmentType(payload);
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
    } finally {
      setLoading(false);
    }
  }

  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitFormId="garment-type-form"
      submitText={initialData ? "Save Changes" : "Create Garment Type"}
      submitting={loading}
      cancelVariant="outline"
      submittingText="Saving Garment..."
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Garment Type" : "Add Garment Type"}
      footerActions={footerActions}
    >
      <Form {...form}>
        <FormStack
          as="form"
          id="garment-type-form"
          onSubmit={form.handleSubmit(onSubmit)}
          density="compact"
          className="px-0.5 pb-2"
        >
          <div className="grid grid-cols-1 gap-3.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Garment Name</FormLabel>
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground">
                    Description (Optional)
                  </FormLabel>
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

          <div className="grid grid-cols-1 gap-3">
            <FormField
              control={form.control}
              name="customerPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Price (Rs)</FormLabel>
                  <FormControl>
                    <Input
                     
                      className="h-9"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Measurement Categories
              </span>
            </div>
            <FormField
              control={form.control}
              name="measurementCategoryIds"
              render={({ field }) => (
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
              render={({ field }) => (
                <FormItem>
                  <InfoTile
                    layout="between"
                    padding="none"
                    className="h-[38px] px-2.5 py-0"
                  >
                    <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground cursor-pointer">
                      Active
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </InfoTile>
                </FormItem>
              )}
            />
          </div>
        </FormStack>
      </Form>
    </ScrollableDialog>
  );
}
