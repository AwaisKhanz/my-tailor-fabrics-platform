"use client";

import type { DragEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  garmentWorkflowStepsFormSchema,
  type WorkflowStepTemplate,
  type WorkflowStepTemplateInput,
} from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import { useUpdateGarmentWorkflowSteps } from "@/hooks/queries/config-queries";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

export interface WorkflowStepDraft extends WorkflowStepTemplateInput {
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

interface UseGarmentWorkflowStepEditorParams {
  open: boolean;
  garmentId: string;
  initialSteps: WorkflowStepTemplate[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function useGarmentWorkflowStepEditor({
  open,
  garmentId,
  initialSteps,
  onOpenChange,
  onSuccess,
}: UseGarmentWorkflowStepEditorParams) {
  const updateGarmentWorkflowStepsMutation = useUpdateGarmentWorkflowSteps();
  const [steps, setSteps] = useState<WorkflowStepDraft[]>([]);
  const [draggingStepId, setDraggingStepId] = useState<string | null>(null);
  const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const loading = updateGarmentWorkflowStepsMutation.isPending;
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
  }, [initialSteps, open]);

  const moveStep = useCallback((sourceId: string, targetId: string) => {
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
  }, []);

  const moveStepByIndex = useCallback(
    (index: number, direction: "up" | "down") => {
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
    },
    [],
  );

  const handleAddStep = useCallback(() => {
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
  }, []);

  const handleRemoveStep = useCallback((index: number) => {
    setValidationError(null);
    setSteps((current) =>
      normalizeStepOrder(
        current.filter((_, currentIndex) => currentIndex !== index),
      ),
    );
  }, []);

  const handleChange = useCallback(
    <K extends keyof WorkflowStepTemplateInput>(
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
    },
    [],
  );

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>, stepId: string) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", stepId);
      setDraggingStepId(stepId);
      setDragOverStepId(stepId);
    },
    [],
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>, targetId: string) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      if (dragOverStepId !== targetId) {
        setDragOverStepId(targetId);
      }
    },
    [dragOverStepId],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>, targetId: string) => {
      event.preventDefault();

      const sourceId =
        event.dataTransfer.getData("text/plain") || draggingStepId;
      if (!sourceId) {
        setDraggingStepId(null);
        setDragOverStepId(null);
        return;
      }

      moveStep(sourceId, targetId);
      setDraggingStepId(null);
      setDragOverStepId(null);
    },
    [draggingStepId, moveStep],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingStepId(null);
    setDragOverStepId(null);
  }, []);

  const submitSteps = useCallback(async () => {
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
      await updateGarmentWorkflowStepsMutation.mutateAsync({
        id: garmentId,
        steps: parsedResult.data.steps,
      });

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
    }
  }, [
    garmentId,
    onOpenChange,
    onSuccess,
    steps,
    toast,
    updateGarmentWorkflowStepsMutation,
  ]);

  return {
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
  };
}
