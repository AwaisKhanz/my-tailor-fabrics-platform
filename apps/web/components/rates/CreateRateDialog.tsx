"use client";

import React from "react";
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
import { IndianRupee, Calendar } from "lucide-react";
import type { CreateRateCardInput } from "@tbms/shared-types";

interface CreateRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRateCardInput) => Promise<void>;
  garmentTypes: { id: string, name: string }[];
  branches: { id: string, name: string, code: string }[];
  steps: string[];
}

export function CreateRateDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  garmentTypes,
  branches,
  steps
}: CreateRateDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    garmentTypeId: "",
    branchId: "GLOBAL",
    stepKey: "",
    rate: "",
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        branchId: formData.branchId === "GLOBAL" ? null : formData.branchId,
        rate: Math.round(parseFloat(formData.rate) * 100)
      });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Rate Card</DialogTitle>
          <DialogDescription>
            Create a new production rate for a specific garment step.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch Scope</Label>
              <Select 
                value={formData.branchId} 
                onValueChange={(val) => setFormData({ ...formData, branchId: val })}
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLOBAL">Global (All Branches)</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="garmentType">Garment Type</Label>
              <Select 
                value={formData.garmentTypeId} 
                onValueChange={(val) => setFormData({ ...formData, garmentTypeId: val })}
              >
                <SelectTrigger id="garmentType">
                  <SelectValue placeholder="Select Garment Type" />
                </SelectTrigger>
                <SelectContent>
                  {garmentTypes.map((gt) => (
                    <SelectItem key={gt.id} value={gt.id}>{gt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stepKey">Production Step</Label>
              <Select 
                value={formData.stepKey} 
                onValueChange={(val) => setFormData({ ...formData, stepKey: val })}
              >
                <SelectTrigger id="stepKey">
                  <SelectValue placeholder="Select Step" />
                </SelectTrigger>
                <SelectContent>
                  {steps.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Rate (Rs.)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="rate" 
                    type="number" 
                    step="0.01" 
                    className="pl-9"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Effective From</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="effectiveFrom" 
                    type="date" 
                    className="pl-9"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Creating..." : "Create Rate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
