"use client";

import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { DialogActionRow, DialogFormActions, DialogSection, FormStack } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Banknote, Calendar } from "lucide-react";
import type { CreateRateCardInput } from "@tbms/shared-types";
import { logDevError } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    garmentTypeId: "",
    branchId: "GLOBAL",
    stepKey: "",
    amount: "",
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async () => {
    const amount = Number.parseFloat(formData.amount);
    if (!formData.garmentTypeId || !formData.stepKey || !formData.effectiveFrom) {
      toast({
        title: "Missing fields",
        description: "Please select garment type, step, and effective date.",
        variant: "destructive",
      });
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      toast({
        title: "Invalid rate",
        description: "Rate must be a valid non-negative number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        branchId: formData.branchId === "GLOBAL" ? null : formData.branchId,
        amount: Math.round(amount * 100)
      });
      onOpenChange(false);
    } catch (err) {
      logDevError("Failed to create rate card:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>New Rate Card</DialogTitle>
          <DialogDescription>
            Create a new production rate for a specific garment step.
          </DialogDescription>
        </DialogHeader>
        <DialogSection>
          <FormStack
            as="form"
            id="create-rate-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
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
                  <Banknote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                  <Input 
                    id="rate" 
                    type="number" 
                    step="0.01" 
                    className="pl-9"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Effective From</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
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
          </FormStack>
        </DialogSection>
        <DialogActionRow>
          <DialogFormActions
            onCancel={() => onOpenChange(false)}
            submitText="Create Rate"
            submittingText="Creating..."
            submitting={loading}
            submitFormId="create-rate-form"
          />
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  );
}
