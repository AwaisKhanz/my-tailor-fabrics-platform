"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { useSystemSettingsPage } from "@/hooks/use-system-settings-page";
import { SystemSettingsStatsGrid } from "@/components/config/system/system-settings-stats-grid";
import { SystemSettingsWorkflowCard } from "@/components/config/system/system-settings-workflow-card";
import { SystemSettingsStateCard } from "@/components/config/system/system-settings-state-card";

export function SystemSettingsPage() {
  const {
    loading,
    saving,
    useTaskWorkflow,
    isDirty,
    lastUpdatedText,
    setUseTaskWorkflow,
    loadSettings,
    handleReset,
    handleSave,
  } = useSystemSettingsPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="System Controls"
          description="Manage global operational behavior for all branches."
          actions={
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadSettings()}
              disabled={loading || saving}
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          }
        />
      </PageSection>

      <PageSection spacing="compact">
        <SystemSettingsStatsGrid
          workflowEnabled={useTaskWorkflow}
          dirty={isDirty}
        />
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
      >
        <SystemSettingsWorkflowCard
          loading={loading}
          saving={saving}
          workflowEnabled={useTaskWorkflow}
          dirty={isDirty}
          onWorkflowChange={setUseTaskWorkflow}
          onReset={handleReset}
          onSave={handleSave}
        />
        <SystemSettingsStateCard
          workflowEnabled={useTaskWorkflow}
          lastUpdatedText={lastUpdatedText}
        />
      </PageSection>
    </PageShell>
  );
}
