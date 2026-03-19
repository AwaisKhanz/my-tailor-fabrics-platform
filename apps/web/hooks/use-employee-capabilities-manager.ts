"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  EmployeeCapability,
  EmployeeCapabilitySnapshot,
  EmployeeCapabilityWindowInput,
  GarmentType,
} from "@tbms/shared-types";
import { employeeCapabilitySnapshotFormSchema } from "@tbms/shared-types";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

function toDateInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface UseEmployeeCapabilitiesManagerParams {
  capabilities: EmployeeCapability[];
  garmentTypes: GarmentType[];
  onSaveCapabilitiesSnapshot: (
    snapshot: EmployeeCapabilitySnapshot,
  ) => Promise<boolean>;
}

export type EmployeeCapabilityStatus = "ACTIVE" | "UPCOMING" | "EXPIRED";

export interface EmployeeCapabilityWithStatus extends EmployeeCapability {
  status: EmployeeCapabilityStatus;
}

export function useEmployeeCapabilitiesManager({
  capabilities,
  garmentTypes,
  onSaveCapabilitiesSnapshot,
}: UseEmployeeCapabilitiesManagerParams) {
  const capabilitiesWithStatus = useMemo<EmployeeCapabilityWithStatus[]>(() => {
    const now = new Date();
    return capabilities
      .filter((capability) => !capability.deletedAt)
      .map((capability) => {
        const effectiveFrom = new Date(capability.effectiveFrom);
        const effectiveTo = capability.effectiveTo
          ? new Date(capability.effectiveTo)
          : null;

        const status: EmployeeCapabilityStatus =
          effectiveFrom > now
            ? "UPCOMING"
            : effectiveTo && effectiveTo < now
              ? "EXPIRED"
              : "ACTIVE";

        return {
          ...capability,
          status,
        };
      });
  }, [capabilities]);

  const activeCapabilities = useMemo(
    () =>
      capabilitiesWithStatus.filter((capability) => capability.status === "ACTIVE"),
    [capabilitiesWithStatus],
  );

  const upcomingCapabilities = useMemo(
    () =>
      capabilitiesWithStatus.filter(
        (capability) => capability.status === "UPCOMING",
      ),
    [capabilitiesWithStatus],
  );

  const garmentNameById = useMemo(
    () =>
      new Map(
        garmentTypes.map((garmentType) => [garmentType.id, garmentType.name]),
      ),
    [garmentTypes],
  );

  const stepKeysByGarmentId = useMemo(() => {
    const map = new Map<string, string[]>();

    for (const garmentType of garmentTypes) {
      const orderedUniqueStepKeys = Array.from(
        new Set(
          (garmentType.workflowSteps ?? []).map(
            (workflowStep) => workflowStep.stepKey,
          ),
        ),
      );
      map.set(garmentType.id, orderedUniqueStepKeys);
    }

    return map;
  }, [garmentTypes]);

  const allWorkflowStepKeys = useMemo(
    () =>
      Array.from(
        new Set(
          garmentTypes.flatMap((garmentType) =>
            (garmentType.workflowSteps ?? []).map(
              (workflowStep) => workflowStep.stepKey,
            ),
          ),
        ),
      ),
    [garmentTypes],
  );

  const getStepOptionsForCapabilityRow = useCallback(
    (garmentTypeId?: string) => {
      if (garmentTypeId) {
        return stepKeysByGarmentId.get(garmentTypeId) ?? [];
      }
      return allWorkflowStepKeys;
    },
    [allWorkflowStepKeys, stepKeysByGarmentId],
  );

  const [capabilityEffectiveFrom, setCapabilityEffectiveFrom] =
    useState<string>(toDateInputValue(new Date().toISOString()));
  const [capabilityNote, setCapabilityNote] = useState<string>("");
  const [capabilityRows, setCapabilityRows] = useState<
    EmployeeCapabilityWindowInput[]
  >([{ garmentTypeId: "", stepKey: "", note: "" }]);
  const [capabilityValidationError, setCapabilityValidationError] =
    useState<string>("");

  useEffect(() => {
    const seededRows =
      activeCapabilities.length > 0
        ? activeCapabilities.map((capability) => ({
            garmentTypeId: capability.garmentTypeId ?? "",
            stepKey: capability.stepKey ?? "",
            note: capability.note ?? "",
          }))
        : upcomingCapabilities.length > 0
          ? upcomingCapabilities.map((capability) => ({
              garmentTypeId: capability.garmentTypeId ?? "",
              stepKey: capability.stepKey ?? "",
              note: capability.note ?? "",
            }))
        : [{ garmentTypeId: "", stepKey: "", note: "" }];
    setCapabilityRows(seededRows);
  }, [activeCapabilities, upcomingCapabilities]);

  const addCapabilityRow = useCallback(() => {
    setCapabilityValidationError("");
    setCapabilityRows((previous) => [
      ...previous,
      { garmentTypeId: "", stepKey: "", note: "" },
    ]);
  }, []);

  const removeCapabilityRow = useCallback((index: number) => {
    setCapabilityValidationError("");
    setCapabilityRows((previous) => {
      if (previous.length <= 1) {
        return previous;
      }
      return previous.filter((_, capabilityIndex) => capabilityIndex !== index);
    });
  }, []);

  const updateCapabilityRow = useCallback(
    (index: number, updater: Partial<EmployeeCapabilityWindowInput>) => {
      setCapabilityValidationError("");
      setCapabilityRows((previous) =>
        previous.map((row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                ...updater,
              }
            : row,
        ),
      );
    },
    [],
  );

  const submitCapabilitiesSnapshot = useCallback(() => {
    const normalizedRows = capabilityRows
      .map((row) => ({
        garmentTypeId: row.garmentTypeId?.trim() || undefined,
        stepKey: row.stepKey?.trim() || undefined,
        note: row.note?.trim() || undefined,
      }))
      .filter((row) => row.garmentTypeId || row.stepKey);

    const snapshot: EmployeeCapabilitySnapshot = {
      effectiveFrom: capabilityEffectiveFrom,
      note: capabilityNote || undefined,
      capabilities: normalizedRows,
    };
    const parsedResult =
      employeeCapabilitySnapshotFormSchema.safeParse(snapshot);
    if (!parsedResult.success) {
      setCapabilityValidationError(getFirstZodErrorMessage(parsedResult.error));
      return;
    }

    setCapabilityValidationError("");
    void onSaveCapabilitiesSnapshot(parsedResult.data);
  }, [
    capabilityEffectiveFrom,
    capabilityNote,
    capabilityRows,
    onSaveCapabilitiesSnapshot,
  ]);

  return {
    activeCapabilities,
    upcomingCapabilities,
    capabilitiesWithStatus,
    garmentNameById,
    capabilityEffectiveFrom,
    capabilityNote,
    capabilityRows,
    capabilityValidationError,
    setCapabilityEffectiveFrom,
    setCapabilityNote,
    addCapabilityRow,
    removeCapabilityRow,
    updateCapabilityRow,
    getStepOptionsForCapabilityRow,
    submitCapabilitiesSnapshot,
  };
}
