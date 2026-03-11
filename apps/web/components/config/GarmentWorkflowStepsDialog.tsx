"use client";

import React from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { type WorkflowStepTemplate } from "@tbms/shared-types";
import { Button } from "@tbms/ui/components/button";
import { FieldError } from "@tbms/ui/components/field";
import { DialogFormActions } from "@tbms/ui/components/form-layout";
import { Input } from "@tbms/ui/components/input";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { Switch } from "@tbms/ui/components/switch";
import { useGarmentWorkflowStepEditor } from "@/hooks/use-garment-workflow-step-editor";

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
  const {
    steps,
    draggingStepId,
    dragOverStepId,
    validationError,
    loading,
    handleAddStep,
    handleRemoveStep,
    handleChange,
    moveStepByIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    submitSteps,
  } = useGarmentWorkflowStepEditor({
    open,
    garmentId,
    initialSteps,
    onOpenChange,
    onSuccess,
  });

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Production Workflow Steps"
      description={`Configure the production steps required for ${garmentName}. Tasks are generated in this order when a new order item is added.`}
      contentSize="4xl"
      maxWidthClass=""
      footerActions={
        <DialogFormActions
          onCancel={() => onOpenChange(false)}
          submitText="Save Workflow"
          submittingText="Saving..."
          submitting={loading}
          submitFormId="garment-workflow-steps-form"
        />
      }
    >
      <form
          id="garment-workflow-steps-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submitSteps();
          }}
          className="space-y-4"
        >
        {validationError ? <FieldError size="sm">{validationError}</FieldError> : null}
          {steps.map((step, index) => (
            <div
              key={step.clientId}
              className={`group flex items-center gap-3 rounded-md bg-muted/40 px-3 py-3 transition-colors ${
                draggingStepId === step.clientId
                  ? "bg-primary/10"
                  : dragOverStepId === step.clientId
                    ? "bg-primary/5"
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

              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Step Name</p>
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
                  <p className="text-xs text-muted-foreground">Unique Key</p>
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
                  <p className="text-xs text-muted-foreground">Required</p>
                  <Switch
                    checked={step.isRequired}
                    onCheckedChange={(value) =>
                      handleChange(index, "isRequired", value)
                    }
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs text-muted-foreground">Active</p>
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
            </div>
          ))}

          {steps.length === 0 ? (
            <div className="rounded-md border border-dashed py-8 text-center text-muted-foreground">
              No steps configured. Add your first step below.
            </div>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={handleAddStep}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Step
          </Button>
      </form>
    </ScrollableDialog>
  );
}
