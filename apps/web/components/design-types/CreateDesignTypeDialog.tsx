"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DesignType } from "@tbms/shared-types";
import { Banknote } from "lucide-react";

interface DesignTypeFormValues extends Omit<Partial<DesignType>, 'garmentTypeId' | 'branchId'> {
  garmentTypeId: string | 'ALL';
  branchId: string | 'ALL';
}

interface CreateDesignTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<DesignType>) => Promise<void>;
  initialData?: DesignType | null;
  garmentTypes: { id: string; name: string }[];
  branches: { id: string; name: string; code: string }[];
}

export function CreateDesignTypeDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData,
  garmentTypes,
  branches
}: CreateDesignTypeDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<DesignTypeFormValues>({
    defaultValues: {
      name: "",
      defaultPrice: 0,
      defaultRate: 0,
      garmentTypeId: "ALL",
      branchId: "ALL",
      sortOrder: 0,
      isActive: true
    }
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          ...initialData,
          garmentTypeId: initialData.garmentTypeId || "ALL",
          branchId: initialData.branchId || "ALL"
        });
      } else {
        reset({
          name: "",
          defaultPrice: 0,
          defaultRate: 0,
          garmentTypeId: "ALL",
          branchId: "ALL",
          sortOrder: 0,
          isActive: true
        });
      }
    }
  }, [open, initialData, reset]);

  const onFormSubmit = async (data: DesignTypeFormValues) => {
    const formattedData: Partial<DesignType> = {
      ...data,
      garmentTypeId: data.garmentTypeId === "ALL" ? null : data.garmentTypeId,
      branchId: data.branchId === "ALL" ? null : data.branchId,
      defaultPrice: Number(data.defaultPrice),
      defaultRate: Number(data.defaultRate),
      sortOrder: Number(data.sortOrder)
    };
    await onSubmit(formattedData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            {initialData ? "Edit Design Type" : "Define Design Type"}
          </DialogTitle>
          <DialogDescription>
            Set standardized customer pricing and employee labor rates for a specific design.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Design Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Simple, Heavy, Embroidery" 
              {...register("name", { required: true })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="defaultPrice">Customer Price (Rs)</Label>
              <Input 
                id="defaultPrice" 
                type="number" 
                {...register("defaultPrice", { required: true, min: 0 })} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="defaultRate">Employee Rate (Rs)</Label>
              <Input 
                id="defaultRate" 
                type="number" 
                {...register("defaultRate", { required: true, min: 0 })} 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Applicable Garment</Label>
            <Select 
              value={watch("garmentTypeId") || "ALL"} 
              onValueChange={(v) => setValue("garmentTypeId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Garments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Garments</SelectItem>
                {garmentTypes.map(gt => (
                  <SelectItem key={gt.id} value={gt.id}>{gt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Branch Scoping</Label>
            <Select 
              value={watch("branchId") || "ALL"} 
              onValueChange={(v) => setValue("branchId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Global (All Branches)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Global (All Branches)</SelectItem>
                {branches.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input 
              id="sortOrder" 
              type="number" 
              {...register("sortOrder")} 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="font-bold">
              {initialData ? "Update Design" : "Create Design"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
