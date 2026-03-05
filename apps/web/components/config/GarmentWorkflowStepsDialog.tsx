"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFormActions, DialogSection, FormStack } from "@/components/ui/form-layout";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { configApi } from "@/lib/api/config";
import {
  garmentWorkflowStepsFormSchema,
  type WorkflowStepTemplate,
  type WorkflowStepTemplateInput,
} from "@tbms/shared-types";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

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
  const [steps, setSteps] = useState<WorkflowStepTemplateInput[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setSteps(
        [...initialSteps]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((step) => ({
            id: step.id,
            stepKey: step.stepKey,
            stepName: step.stepName,
            sortOrder: step.sortOrder,
            isRequired: step.isRequired,
            isActive: step.isActive,
          }))
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

  const handleChange = <K extends keyof WorkflowStepTemplateInput>(
    index: number,
    field: K,
    value: WorkflowStepTemplateInput[K],
  ) => {
    const newSteps = [...steps];
    
    // Auto-generate stepKey from stepName if stepKey is empty and user is typing stepName
    if (
      field === "stepName" &&
      typeof value === "string" &&
      !newSteps[index].stepKey
    ) {
        newSteps[index] = { 
            ...newSteps[index], 
            stepName: value,
            stepKey: value.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "")
        };
    } else {
        newSteps[index] = { ...newSteps[index], [field]: value };
    }
    setSteps(newSteps);
  };

  const onSubmit = async () => {
    const parsedResult = garmentWorkflowStepsFormSchema.safeParse({ steps });
    if (!parsedResult.success) {
      toast({
        title: "Validation error",
        description: getFirstZodErrorMessage(parsedResult.error),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Ensure correct sort order based on array position
      const payload: WorkflowStepTemplateInput[] = parsedResult.data.steps.map((step, index) => ({
          ...step,
          sortOrder: index + 1,
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
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Production Workflow Steps"
      description={`Configure the production steps required for ${garmentName}. Tasks are generated in this order when a new order item is added.`}
      contentSize="2xl"
      maxWidthClass="sm:max-w-[700px]"
      maxHeightClass="max-h-[90vh]"
      footerActions={
        <DialogFormActions
          onCancel={() => onOpenChange(false)}
          submitText="Save Workflow"
          submittingText="Saving..."
          submitting={loading}
          submitFormId="garment-workflow-steps-form"
          submitVariant="premium"
        />
      }
    >
        <DialogSection className="pt-0">
          <FormStack
            as="form"
            id="garment-workflow-steps-form"
            onSubmit={(event) => {
              event.preventDefault();
              void onSubmit();
            }}
          >
            {steps.map((step, index) => (
              <InfoTile key={index} padding="content" className="group flex items-center gap-3">
                <div className="flex cursor-move flex-col items-center justify-center text-text-secondary hover:text-text-primary">
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
                      <Label variant="dashboard" className="text-text-secondary">Required</Label>
                      <Switch
                          checked={step.isRequired}
                          onCheckedChange={(v) => handleChange(index, "isRequired", v)}
                      />
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <Label variant="dashboard" className="text-text-secondary">Active</Label>
                      <Switch
                          checked={step.isActive}
                          onCheckedChange={(v) => handleChange(index, "isActive", v)}
                      />
                   </div>
                </div>

                <Button
                  type="button"
                  variant="tableDanger"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleRemoveStep(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </InfoTile>
            ))}

            {steps.length === 0 ? (
              <InfoTile borderStyle="dashedStrong" padding="none" className="py-8 text-center text-text-secondary">
                No steps configured. Add your first step below.
              </InfoTile>
            ) : null}

            <Button type="button" variant="outlineDashed" className="w-full" onClick={handleAddStep}>
              <Plus className="mr-2 h-4 w-4" /> Add Step
            </Button>
          </FormStack>
        </DialogSection>
    </ScrollableDialog>
  );
}
