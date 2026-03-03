"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogActionRow, DialogFormActions, DialogSection, FormStack } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { configApi } from "@/lib/api/config";
import { WorkflowStepTemplate } from "@tbms/shared-types";
import { DEFAULT_WORKFLOW_STEP_PRESETS } from "@tbms/shared-constants";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface GarmentWorkflowStepsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garmentId: string;
  garmentName: string;
  initialSteps: WorkflowStepTemplate[];
  onSuccess: () => void;
}

export function GarmentWorkflowStepsDialog({
  open,
  onOpenChange,
  garmentId,
  garmentName,
  initialSteps,
  onSuccess,
}: GarmentWorkflowStepsDialogProps) {
  const [steps, setSteps] = useState<Partial<WorkflowStepTemplate>[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setSteps(
        initialSteps.length > 0 
        ? [...initialSteps].sort((a, b) => a.sortOrder - b.sortOrder)
        : DEFAULT_WORKFLOW_STEP_PRESETS.map((step) => ({ ...step }))
      );
    }
  }, [open, initialSteps]);

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        stepKey: "",
        stepName: "",
        sortOrder: steps.length + 1,
        isRequired: true,
        isActive: true,
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof WorkflowStepTemplate, value: string | number | boolean) => {
    const newSteps = [...steps];
    
    // Auto-generate stepKey from stepName if stepKey is empty and user is typing stepName
    if (field === "stepName" && typeof value === "string" && !newSteps[index].stepKey) {
        newSteps[index] = { 
            ...newSteps[index], 
            stepName: value,
            stepKey: value.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "")
        };
    } else {
        newSteps[index] = { ...newSteps[index], [field]: value as never };
    }
    setSteps(newSteps);
  };

  const onSubmit = async () => {
    // Validation
    if (steps.some(s => !s.stepKey || !s.stepName)) {
        toast({ title: "Validation Error", description: "All steps must have a Key and Name.", variant: "destructive" });
        return;
    }
    
    // Check duplicate keys
    const keys = steps.map(s => s.stepKey);
    if (new Set(keys).size !== keys.length) {
        toast({ title: "Validation Error", description: "Step Keys must be unique.", variant: "destructive" });
        return;
    }

    try {
      setLoading(true);
      
      // Ensure correct sort order based on array position
      const payload = steps.map((s, index) => ({
          ...s,
          sortOrder: index + 1
      }));

      await configApi.updateGarmentWorkflowSteps(garmentId, payload);
      
      toast({ title: "Success", description: "Workflow steps updated successfully." });
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Failed to update workflow steps.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Production Workflow Steps</DialogTitle>
          <DialogDescription>
            Configure the production steps required for <strong>{garmentName}</strong>. 
            Tasks will be generated in this order when a new item is added to an order.
          </DialogDescription>
        </DialogHeader>

        <DialogSection>
          <FormStack
            as="form"
            id="garment-workflow-steps-form"
            onSubmit={(event) => {
              event.preventDefault();
              void onSubmit();
            }}
          >
            {steps.map((step, index) => (
              <div key={index} className="group flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                <div className="flex cursor-move flex-col items-center justify-center text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-[10px] font-bold">{index + 1}</span>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label variant="dashboard">Step Name</Label>
                    <Input
                      placeholder="e.g. Cutting"
                      value={step.stepName || ""}
                      onChange={(e) => handleChange(index, "stepName", e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label variant="dashboard">Unique Key</Label>
                    <Input
                      placeholder="e.g. CUTTING"
                      value={step.stepKey || ""}
                      onChange={(e) => handleChange(index, "stepKey", e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                      className="h-8 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 border-l border-r px-2">
                   <div className="flex flex-col items-center gap-1">
                      <Label variant="dashboard" className="text-muted-foreground">Required</Label>
                      <Switch
                          checked={step.isRequired}
                          onCheckedChange={(v) => handleChange(index, "isRequired", v)}
                      />
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <Label variant="dashboard" className="text-muted-foreground">Active</Label>
                      <Switch
                          checked={step.isActive}
                          onCheckedChange={(v) => handleChange(index, "isActive", v)}
                      />
                   </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveStep(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {steps.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed py-8 text-center text-muted-foreground">
                No steps configured. Add your first step below.
              </div>
            ) : null}

            <Button type="button" variant="outline" className="w-full border-dashed" onClick={handleAddStep}>
              <Plus className="mr-2 h-4 w-4" /> Add Step
            </Button>
          </FormStack>
        </DialogSection>

        <DialogActionRow>
          <DialogFormActions
            onCancel={() => onOpenChange(false)}
            submitText="Save Workflow"
            submittingText="Saving..."
            submitting={loading}
            submitFormId="garment-workflow-steps-form"
            submitVariant="premium"
          />
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  );
}
