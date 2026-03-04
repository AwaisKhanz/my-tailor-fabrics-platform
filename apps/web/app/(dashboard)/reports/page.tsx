"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsExportsTab } from "@/components/reports/reports-exports-tab";
import { ReportsFinancialTab } from "@/components/reports/reports-financial-tab";
import { ReportsOperationsTab } from "@/components/reports/reports-operations-tab";
import { ReportsOverviewTab } from "@/components/reports/reports-overview-tab";
import { ReportsWorkspaceFilters } from "@/components/reports/reports-workspace-filters";
import { useReportsWorkspace } from "@/hooks/use-reports-workspace";
import { useAuthz } from "@/hooks/use-authz";
import { withRoleGuard } from "@/components/auth/with-role-guard";

const REPORT_TABS = [
  { key: "overview", label: "Overview" },
  { key: "financial", label: "Financial" },
  { key: "operations", label: "Operations" },
  { key: "exports", label: "Exports" },
] as const;

function ReportsPage() {
  const { canAll } = useAuthz();
  const canExportReports = canAll(["reports.export"]);
  const {
    activeTab,
    setActiveTab,
    preset,
    applyPreset,
    dateRange,
    setDateRangeValue,
    granularity,
    setGranularity,
    datePresetOptions,
    loading,
    summary,
    financialTrend,
    distributions,
    productivity,
    exportingKey,
    printingWeekly,
    refreshAnalytics,
    exportReport,
    printWeeklySummary,
  } = useReportsWorkspace();

  return (
    <PageShell spacing="default">
      <PageSection spacing="compact">
        <PageHeader
          title="Analytics & Intelligence"
          description="Review performance by period with focused financial and operations views."
          actions={
            <Button
              variant="outline"
              className="w-full border-primary/20 font-bold text-primary hover:bg-primary/5 sm:w-auto"
              onClick={refreshAnalytics}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh Feed"}
            </Button>
          }
        />
      </PageSection>

      <PageSection spacing="compact">
        <ReportsWorkspaceFilters
          preset={preset}
          presetOptions={datePresetOptions}
          dateRange={dateRange}
          granularity={granularity}
          loading={loading}
          onPresetChange={applyPreset}
          onDateChange={setDateRangeValue}
          onGranularityChange={setGranularity}
        />
      </PageSection>

      <PageSection spacing="compact">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <div className="overflow-x-auto pb-1">
            <TabsList className="h-auto min-w-max justify-start gap-1 rounded-xl border border-border/70 bg-card p-1">
              {REPORT_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="h-9 px-4 text-xs font-semibold uppercase tracking-[0.08em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-4">
            <ReportsOverviewTab
              loading={loading}
              summary={summary}
              financialTrend={financialTrend}
              distributions={distributions}
              productivity={productivity}
            />
          </TabsContent>

          <TabsContent value="financial" className="mt-4">
            <ReportsFinancialTab loading={loading} trend={financialTrend} />
          </TabsContent>

          <TabsContent value="operations" className="mt-4">
            <ReportsOperationsTab
              loading={loading}
              distributions={distributions}
              productivity={productivity}
            />
          </TabsContent>

          <TabsContent value="exports" className="mt-4">
            <ReportsExportsTab
              exportingKey={exportingKey}
              printingWeekly={printingWeekly}
              onExport={exportReport}
              onPrint={printWeeklySummary}
              canExport={canExportReports}
            />
          </TabsContent>
        </Tabs>
      </PageSection>
    </PageShell>
  );
}

export default withRoleGuard(ReportsPage, { all: ["reports.read"] });
