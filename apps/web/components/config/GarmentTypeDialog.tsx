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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/multi-select";
import { Loader2, Filter, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { configApi } from "@/lib/api/config";
import { typedZodResolver } from "@/lib/utils/form";
import { garmentTypeSchema, GarmentTypeFormValues } from "@/types/config/schemas";
import type { GarmentType, MeasurementCategory } from "@tbms/shared-types";

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
        console.error("Failed to fetch categories", err);
      }
    };
    if (open) fetchCategories();
  }, [open]);
  
  const form = useForm<GarmentTypeFormValues>({
    resolver: typedZodResolver<GarmentTypeFormValues>(garmentTypeSchema),
    defaultValues: {
      name: "",
      customerPrice: 0,
      employeeRate: 0,
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
        employeeRate: initialData.employeeRate / 100,
        sortOrder: initialData.sortOrder,
        isActive: initialData.isActive,
        measurementCategoryIds: (initialData.measurementCategories as MeasurementCategory[])?.map((c) => c.id) ?? [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        customerPrice: 0,
        employeeRate: 0,
        sortOrder: 0,
        isActive: true,
        measurementCategoryIds: [],
      });
    }
  }, [initialData, form, open]);

  async function onSubmit(data: GarmentTypeFormValues) {
    setLoading(true);
    try {
      const payload: Partial<GarmentTypeFormValues> = {
        ...data,
        customerPrice: Math.round(data.customerPrice * 100),
        employeeRate: Math.round(data.employeeRate * 100),
      };

      if (initialData) {
        await configApi.updateGarmentType(initialData.id, payload);
      } else {
        await configApi.createGarmentType(payload);
      }

      toast({ 
        title: "Success", 
        description: "Garment updated successfully" 
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
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
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button type="submit" form="garment-type-form" variant="premium" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Save Changes" : "Create Garment Type"}
      </Button>
    </div>
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Garment Type" : "Add Garment Type"}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-[380px]"
    >
      <Form {...form}>
        <form id="garment-type-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 px-0.5 pb-2">
          <div className="grid grid-cols-1 gap-3.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Garment Name</FormLabel>
                  <FormControl>
                    <Input variant="premium" className="h-9 text-sm" placeholder="e.g. Mens Shirt" {...field} />
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
                  <FormLabel className="text-xs font-bold">Description (Optional)</FormLabel>
                  <FormControl>
                    <Input variant="premium" className="h-9 text-sm" placeholder="e.g. Standard fitting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Base Pricing</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="customerPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px]">Price (Rs)</FormLabel>
                    <FormControl>
                      <Input variant="premium" className="h-9" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px]">Rate (Rs)</FormLabel>
                    <FormControl>
                      <Input variant="premium" className="h-9" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Measurement Categories</span>
            </div>
            <FormField
              control={form.control}
              name="measurementCategoryIds"
              render={({ field }) => (
                <FormItem>
                   <FormControl>
                    <MultiSelect
                       className="min-h-9 py-1 text-sm pt-1.5"
                       options={categories.map(c => ({ label: c.name, value: c.id }))}
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-2.5 h-[38px] bg-muted/20">
                  <FormLabel className="text-xs font-bold cursor-pointer">Active</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </ScrollableDialog>
  );
}
