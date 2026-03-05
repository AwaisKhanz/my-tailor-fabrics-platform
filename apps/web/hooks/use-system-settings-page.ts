"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SystemSettings } from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import { configApi } from "@/lib/api/config";
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [useTaskWorkflow, setUseTaskWorkflow] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await configApi.getSystemSettings();
      if (response.success && response.data) {
        setSettings(response.data);
        setUseTaskWorkflow(response.data.useTaskWorkflow);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(error, "Failed to load system settings."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

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

    setSaving(true);
    try {
      const response = await configApi.updateSystemSettings({
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
        description: getApiErrorMessageOrFallback(error, "Failed to save system settings."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [isDirty, toast, useTaskWorkflow]);

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
