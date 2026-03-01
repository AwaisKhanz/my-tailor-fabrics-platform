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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Loader2, Filter, Building2, Globe } from "lucide-react";
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
  branchId?: string;
  branchName?: string;
}

export function GarmentTypeDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  branchId,
  branchName,
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
      branchCustomerPrice: 0,
      branchEmployeeRate: 0,
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
        branchCustomerPrice: (initialData.resolvedCustomerPrice ?? initialData.customerPrice) / 100,
        branchEmployeeRate: (initialData.resolvedEmployeeRate ?? initialData.employeeRate) / 100,
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
        branchCustomerPrice: 0,
        branchEmployeeRate: 0,
        measurementCategoryIds: [],
      });
    }
  }, [initialData, form, open]);

  async function onSubmit(data: GarmentTypeFormValues) {
    setLoading(true);
    try {
      // 1. Prepare and update Global Garment Details
      // We extract branch prices so they don't get sent to the global update API
      const globalPayload: Partial<GarmentTypeFormValues> = {
        ...data,
        customerPrice: Math.round(data.customerPrice * 100),
        employeeRate: Math.round(data.employeeRate * 100),
      };

      // Remove branch-specific fields from global payload
      delete globalPayload.branchCustomerPrice;
      delete globalPayload.branchEmployeeRate;

      if (initialData) {
        await configApi.updateGarmentType(initialData.id, globalPayload);
      } else {
        await configApi.createGarmentType(globalPayload);
      }

      // 2. If Branch ID is present, update the Branch Override
      if (branchId && initialData && data.branchCustomerPrice !== undefined) {
          await configApi.setBranchPrice(initialData.id, {
            customerPrice: Math.round(data.branchCustomerPrice * 100),
            employeeRate: Math.round((data.branchEmployeeRate || 0) * 100),
          }, branchId);
      }

      toast({ 
        title: "Success", 
        description: branchId ? `Garment and ${branchName} prices updated` : "Garment updated successfully" 
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
      title={branchId ? `Edit Branch Pricing` : (initialData ? "Edit Garment Type" : "Add Garment Type")}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-[425px]"
    >
      {branchId && (
        <div className="mb-4 p-3 bg-muted rounded-lg border border-border flex flex-col gap-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Configuring Branch</span>
          <span className="text-sm font-bold text-foreground leading-tight">{branchName}</span>
        </div>
      )}
      {!branchId && (initialData?.overridesCount ?? 0) > 0 && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
             <Filter className="h-4 w-4 text-warning" />
          </div>
          <div className="flex flex-col gap-0.5">
             <p className="text-sm font-bold text-warning leading-tight">Branch Overrides Active</p>
             <p className="text-[11px] font-medium text-warning/80 leading-normal">
                 This garment has custom prices in <strong>{initialData?.overridesCount} branches</strong>. 
                Your manual global changes here will <strong>not</strong> update those branches.
             </p>
          </div>
        </div>
      )}
      <Form {...form}>
        <form id="garment-type-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 pb-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Garment Name</FormLabel>
                <FormControl>
                  <Input variant="premium" placeholder="e.g. Mens Shirt" {...field} />
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
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Input variant="premium" placeholder="e.g. Standard mens shirt fitting" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <div className="flex items-center gap-2 pt-2">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Base Pricing</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Price (Rs)</FormLabel>
                    <FormControl>
                      <Input variant="premium" type="number" {...field} />
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
                    <FormLabel>Default Rate (Rs)</FormLabel>
                    <FormControl>
                      <Input variant="premium" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border mt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Measurement Categories</span>
            </div>
            <FormField
              control={form.control}
              name="measurementCategoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Select connected forms (Shalwar, Kameez, etc.)</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={cn(
                          "flex items-center space-x-2 rounded-lg border p-2 transition-colors cursor-pointer hover:bg-muted/50",
                          field.value?.includes(category.id) ? "border-primary bg-primary/5" : "border-border"
                        )}
                        onClick={() => {
                          const current = field.value || [];
                          const updated = current.includes(category.id)
                            ? current.filter((id) => id !== category.id)
                            : [...current, category.id];
                          field.onChange(updated);
                        }}
                      >
                        <Checkbox
                          id={`cat-${category.id}`}
                          checked={field.value?.includes(category.id)}
                          onCheckedChange={() => {}} // Handled by div onClick for better UX
                        />
                        <label
                          htmlFor={`cat-${category.id}`}
                          className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer pointer-events-none"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {branchId && (
            <div className="space-y-4 pt-6 border-t border-border mt-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{branchName} Overrides</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="branchCustomerPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Price (Rs)</FormLabel>
                      <FormControl>
                        <Input variant="premium" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branchEmployeeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Rate (Rs)</FormLabel>
                      <FormControl>
                        <Input variant="premium" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
            <div className="grid grid-cols-2 gap-4 items-center">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <Switch
                        variant="premium"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input variant="premium" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
        </form>
      </Form>
    </ScrollableDialog>
  );
}
