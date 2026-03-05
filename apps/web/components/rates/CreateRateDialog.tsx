"use client";

import React from "react";
import {
  DialogFormActions,
  DialogSection,
  FormStack,
} from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banknote, Calendar } from "lucide-react";
import {
  rateCardCreateFormSchema,
  type CreateRateCardInput,
} from "@tbms/shared-types";
import { logDevError } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

interface CreateRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRateCardInput) => Promise<void>;
  garmentTypes: { id: string; name: string }[];
  branches: { id: string; name: string; code: string }[];
  steps?: string[];
  stepsByGarmentTypeId?: Record<string, string[]>;
}

export function CreateRateDialog({
  open,
  onOpenChange,
  onSubmit,
  garmentTypes,
  branches,
  steps = [],
  stepsByGarmentTypeId,
}: CreateRateDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    garmentTypeId: "",
    branchId: "GLOBAL",
    stepKey: "",
    amount: "",
    effectiveFrom: new Date().toISOString().split("T")[0],
  });

  const availableSteps = React.useMemo(() => {
    if (stepsByGarmentTypeId) {
      if (!formData.garmentTypeId) {
        return [];
      }
      return stepsByGarmentTypeId[formData.garmentTypeId] ?? [];
    }
    return steps;
  }, [formData.garmentTypeId, steps, stepsByGarmentTypeId]);

  const hasGarmentSelected = Boolean(formData.garmentTypeId);
  const hasAvailableSteps = availableSteps.length > 0;
  const noStepsConfigured = hasGarmentSelected && !hasAvailableSteps;

  React.useEffect(() => {
    if (!formData.stepKey) {
      return;
    }

    if (!availableSteps.includes(formData.stepKey)) {
      setFormData((current) => ({
        ...current,
        stepKey: "",
      }));
    }
  }, [availableSteps, formData.stepKey]);

  const handleSubmit = async () => {
    const parsedResult = rateCardCreateFormSchema.safeParse(formData);
    if (!parsedResult.success) {
      toast({
        title: "Validation error",
        description: getFirstZodErrorMessage(parsedResult.error),
        variant: "destructive",
      });
      return;
    }

    const validated = parsedResult.data;

    setLoading(true);
    try {
      await onSubmit({
        garmentTypeId: validated.garmentTypeId,
        stepKey: validated.stepKey,
        effectiveFrom: validated.effectiveFrom,
        branchId: validated.branchId === "GLOBAL" ? null : validated.branchId,
        amount: Math.round(validated.amount * 100),
      });
      onOpenChange(false);
    } catch (err) {
      logDevError("Failed to create rate card:", err);
    } finally {
      setLoading(false);
    }
  };

  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitText="Create Rate"
      submittingText="Creating..."
      submitting={loading}
      submitDisabled={noStepsConfigured}
      submitFormId="create-rate-form"
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New Rate Card"
      description="Create a new production rate for a specific garment step."
      footerActions={footerActions}
    >
      <DialogSection className="pt-0">
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
                onValueChange={(val) =>
                  setFormData({ ...formData, branchId: val })
                }
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
                onValueChange={(val) =>
                  setFormData((current) => {
                    const nextSteps = stepsByGarmentTypeId
                      ? (stepsByGarmentTypeId[val] ?? [])
                      : steps;

                    return {
                      ...current,
                      garmentTypeId: val,
                      stepKey: nextSteps.includes(current.stepKey)
                        ? current.stepKey
                        : "",
                    };
                  })
                }
              >
                <SelectTrigger id="garmentType">
                  <SelectValue placeholder="Select Garment Type" />
                </SelectTrigger>
                <SelectContent>
                  {garmentTypes.map((gt) => (
                    <SelectItem key={gt.id} value={gt.id}>
                      {gt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stepKey">Production Step</Label>
              <Select
                value={formData.stepKey}
                onValueChange={(val) =>
                  setFormData({ ...formData, stepKey: val })
                }
                disabled={!hasGarmentSelected || !hasAvailableSteps}
              >
                <SelectTrigger id="stepKey">
                  <SelectValue placeholder="Select Step" />
                </SelectTrigger>
                <SelectContent>
                  {availableSteps.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!hasGarmentSelected ? (
                <p className="text-xs text-text-secondary">
                  Select a garment type first to load workflow steps.
                </p>
              ) : null}
              {noStepsConfigured ? (
                <p className="text-xs text-warning">
                  No active workflow steps are configured for this garment. Add
                  and save workflow steps first.
                </p>
              ) : null}
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
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        effectiveFrom: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>
        </FormStack>
      </DialogSection>
    </ScrollableDialog>
  );
}
