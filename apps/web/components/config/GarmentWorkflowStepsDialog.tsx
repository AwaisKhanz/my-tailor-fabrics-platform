"use client";

import React, { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  garmentWorkflowStepsFormSchema,
  type WorkflowStepTemplate,
  type WorkflowStepTemplateInput,
} from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import {
  DialogFormActions,
  DialogSection,
  FormStack,
} from "@/components/ui/form-layout";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { configApi } from "@/lib/api/config";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

interface GarmentWorkflowStepsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garmentId: string;
  garmentName: string;
  initialSteps: WorkflowStepTemplate[];
  onSuccess: () => void;
}

interface WorkflowStepDraft extends WorkflowStepTemplateInput {
  clientId: string;
}

function createClientId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `step_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeStepOrder(steps: WorkflowStepDraft[]): WorkflowStepDraft[] {
  return steps.map((step, index) => ({
    ...step,
    sortOrder: index + 1,
  }));
}

export function GarmentWorkflowStepsDialog({
  open,
  onOpenChange,
  garmentId,
  garmentName,
  initialSteps,
  onSuccess,
}: GarmentWorkflowStepsDialogProps) {
  const [steps, setSteps] = useState<WorkflowStepDraft[]>([]);
  const [draggingStepId, setDraggingStepId] = useState<string | null>(null);
  const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setValidationError(null);
      setSteps(
        normalizeStepOrder(
          [...initialSteps]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((step) => ({
              clientId: step.id ?? createClientId(),
              id: step.id,
              stepKey: step.stepKey,
              stepName: step.stepName,
              sortOrder: step.sortOrder,
              isRequired: step.isRequired,
              isActive: step.isActive,
            })),
        ),
      );
    } else {
      setValidationError(null);
      setDraggingStepId(null);
      setDragOverStepId(null);
    }
  }, [open, initialSteps]);

  const moveStep = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) {
      return;
    }

    setSteps((current) => {
      const sourceIndex = current.findIndex(
        (step) => step.clientId === sourceId,
      );
      const targetIndex = current.findIndex(
        (step) => step.clientId === targetId,
      );

      if (sourceIndex < 0 || targetIndex < 0) {
        return current;
      }

      const reordered = [...current];
      const [movedStep] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, movedStep);

      return normalizeStepOrder(reordered);
    });
  };

  const moveStepByIndex = (index: number, direction: "up" | "down") => {
    setSteps((current) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const reordered = [...current];
      const [movedStep] = reordered.splice(index, 1);
      reordered.splice(targetIndex, 0, movedStep);

      return normalizeStepOrder(reordered);
    });
  };

  const handleAddStep = () => {
    setValidationError(null);
    setSteps((current) =>
      normalizeStepOrder([
        ...current,
        {
          clientId: createClientId(),
          stepKey: "",
          stepName: "",
          sortOrder: current.length + 1,
          isRequired: true,
          isActive: true,
        },
      ]),
    );
  };

  const handleRemoveStep = (index: number) => {
    setValidationError(null);
    setSteps((current) =>
      normalizeStepOrder(
        current.filter((_, currentIndex) => currentIndex !== index),
      ),
    );
  };

  const handleChange = <K extends keyof WorkflowStepTemplateInput>(
    index: number,
    field: K,
    value: WorkflowStepTemplateInput[K],
  ) => {
    setValidationError(null);
    setSteps((current) => {
      const nextSteps = [...current];

      if (
        field === "stepName" &&
        typeof value === "string" &&
        !nextSteps[index].stepKey
      ) {
        nextSteps[index] = {
          ...nextSteps[index],
          stepName: value,
          stepKey: value
            .toUpperCase()
            .replace(/\s+/g, "_")
            .replace(/[^A-Z0-9_]/g, ""),
        };
      } else {
        nextSteps[index] = { ...nextSteps[index], [field]: value };
      }

      return nextSteps;
    });
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    stepId: string,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", stepId);
    setDraggingStepId(stepId);
    setDragOverStepId(stepId);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    targetId: string,
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (dragOverStepId !== targetId) {
      setDragOverStepId(targetId);
    }
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    targetId: string,
  ) => {
    event.preventDefault();

    const sourceId = event.dataTransfer.getData("text/plain") || draggingStepId;
    if (!sourceId) {
      setDraggingStepId(null);
      setDragOverStepId(null);
      return;
    }

    moveStep(sourceId, targetId);
    setDraggingStepId(null);
    setDragOverStepId(null);
  };

  const handleDragEnd = () => {
    setDraggingStepId(null);
    setDragOverStepId(null);
  };

  const onSubmit = async () => {
    const payload = normalizeStepOrder([...steps]).map((step) => ({
      id: step.id,
      stepKey: step.stepKey,
      stepName: step.stepName,
      sortOrder: step.sortOrder,
      isRequired: step.isRequired,
      isActive: step.isActive,
    }));

    const parsedResult = garmentWorkflowStepsFormSchema.safeParse({
      steps: payload,
    });
    if (!parsedResult.success) {
      setValidationError(getFirstZodErrorMessage(parsedResult.error));
      return;
    }
    setValidationError(null);

    try {
      setLoading(true);
      await configApi.updateGarmentWorkflowSteps(
        garmentId,
        parsedResult.data.steps,
      );

      toast({
        title: "Success",
        description: "Workflow steps updated successfully.",
      });
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update workflow steps.",
        variant: "destructive",
      });
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
          submitVariant="default"
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
          {validationError ? (
            <p className="text-xs text-destructive">{validationError}</p>
          ) : null}
          {steps.map((step, index) => (
            <InfoTile
              tone="info"
              key={step.clientId}
              padding="content"
              className={`group flex items-center gap-3 transition-colors ${
                draggingStepId === step.clientId
                  ? "border-primary/45 bg-primary/10"
                  : dragOverStepId === step.clientId
                    ? "border-primary/35 bg-primary/8"
                    : ""
              }`}
              onDragOver={(event) => handleDragOver(event, step.clientId)}
              onDrop={(event) => handleDrop(event, step.clientId)}
            >
              <div
                draggable
                onDragStart={(event) => handleDragStart(event, step.clientId)}
                onDragEnd={handleDragEnd}
                className="flex cursor-grab flex-col items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
                title="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
                <span className="text-xs font-bold">{index + 1}</span>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm font-bold uppercase  text-muted-foreground">
                    Step Name
                  </Label>
                  <Input
                    placeholder="e.g. Cutting"
                    value={step.stepName || ""}
                    onChange={(event) =>
                      handleChange(index, "stepName", event.target.value)
                    }
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-bold uppercase  text-muted-foreground">
                    Unique Key
                  </Label>
                  <Input
                    placeholder="e.g. CUTTING"
                    value={step.stepKey || ""}
                    onChange={(event) =>
                      handleChange(
                        index,
                        "stepKey",
                        event.target.value.toUpperCase().replace(/\s+/g, "_"),
                      )
                    }
                    className="h-8 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 border-l border-r px-2">
                <div className="flex flex-col items-center gap-1">
                  <Label className="text-sm font-bold uppercase  text-muted-foreground">
                    Required
                  </Label>
                  <Switch
                    checked={step.isRequired}
                    onCheckedChange={(value) =>
                      handleChange(index, "isRequired", value)
                    }
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Label className="text-sm font-bold uppercase  text-muted-foreground">
                    Active
                  </Label>
                  <Switch
                    checked={step.isActive}
                    onCheckedChange={(value) =>
                      handleChange(index, "isActive", value)
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveStepByIndex(index, "up")}
                  disabled={index === 0}
                  title="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveStepByIndex(index, "down")}
                  disabled={index === steps.length - 1}
                  title="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleRemoveStep(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </InfoTile>
          ))}

          {steps.length === 0 ? (
            <InfoTile
              borderStyle="dashedStrong"
              padding="none"
              className="py-8 text-center text-muted-foreground"
            >
              No steps configured. Add your first step below.
            </InfoTile>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={handleAddStep}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Step
          </Button>
        </FormStack>
      </DialogSection>
    </ScrollableDialog>
  );
}
