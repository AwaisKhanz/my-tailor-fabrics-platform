"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SystemSettings } from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import {
  useSystemSettings,
  useUpdateSystemSettings,
} from "@/hooks/queries/config-queries";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";

function formatTimestamp(value?: string | Date): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}

export function useSystemSettingsPage() {
  const { toast } = useToast();
  const systemSettingsQuery = useSystemSettings();
  const updateSystemSettingsMutation = useUpdateSystemSettings();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [useTaskWorkflow, setUseTaskWorkflow] = useState(false);
  const loading = systemSettingsQuery.isLoading;
  const saving = updateSystemSettingsMutation.isPending;

  const loadSettings = useCallback(async () => {
    await systemSettingsQuery.refetch();
  }, [systemSettingsQuery]);

  useEffect(() => {
    if (!systemSettingsQuery.data?.success || !systemSettingsQuery.data.data) {
      return;
    }

    setSettings(systemSettingsQuery.data.data);
    setUseTaskWorkflow(systemSettingsQuery.data.data.useTaskWorkflow);
  }, [systemSettingsQuery.data]);

  useEffect(() => {
    if (!systemSettingsQuery.isError) {
      return;
    }

    toast({
      title: "Error",
      description: getApiErrorMessageOrFallback(
        systemSettingsQuery.error,
        "Failed to load system settings.",
      ),
      variant: "destructive",
    });
  }, [systemSettingsQuery.error, systemSettingsQuery.isError, toast]);

  const isDirty = useMemo(() => {
    if (!settings) {
      return false;
    }
    return settings.useTaskWorkflow !== useTaskWorkflow;
  }, [settings, useTaskWorkflow]);

  const handleReset = useCallback(() => {
    if (!settings) {
      return;
    }
    setUseTaskWorkflow(settings.useTaskWorkflow);
  }, [settings]);

  const handleSave = useCallback(async () => {
    if (!isDirty) {
      return;
    }

    try {
      const response = await updateSystemSettingsMutation.mutateAsync({
        useTaskWorkflow,
      });

      if (response.success && response.data) {
        setSettings(response.data);
        setUseTaskWorkflow(response.data.useTaskWorkflow);
      } else {
        setSettings((previous) =>
          previous
            ? {
                ...previous,
                useTaskWorkflow,
                updatedAt: new Date().toISOString(),
              }
            : previous,
        );
      }

      toast({
        title: "Saved",
        description: "System controls updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(
          error,
          "Failed to save system settings.",
        ),
        variant: "destructive",
      });
    }
  }, [isDirty, toast, updateSystemSettingsMutation, useTaskWorkflow]);

  return {
    loading,
    saving,
    settings,
    useTaskWorkflow,
    isDirty,
    lastUpdatedText: formatTimestamp(settings?.updatedAt),
    setUseTaskWorkflow,
    loadSettings,
    handleReset,
    handleSave,
  };
}
