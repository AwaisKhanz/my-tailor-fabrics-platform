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
import { PERMISSION } from '@tbms/shared-constants';

const REPORT_TABS = [
  { key: "overview", label: "Overview" },
  { key: "financial", label: "Financial" },
  { key: "operations", label: "Operations" },
  { key: "exports", label: "Exports" },
] as const;

function isReportTabKey(
  value: string,
): value is (typeof REPORT_TABS)[number]["key"] {
  return REPORT_TABS.some((tab) => tab.key === value);
}

function ReportsPage() {
  const { canAll } = useAuthz();
  const canExportReports = canAll([PERMISSION["reports.export"]]);
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

  const reportTabContent = {
    overview: (
      <ReportsOverviewTab
        loading={loading}
        summary={summary}
        financialTrend={financialTrend}
        distributions={distributions}
        productivity={productivity}
      />
    ),
    financial: <ReportsFinancialTab loading={loading} trend={financialTrend} />,
    operations: (
      <ReportsOperationsTab
        loading={loading}
        distributions={distributions}
        productivity={productivity}
      />
    ),
    exports: (
      <ReportsExportsTab
        exportingKey={exportingKey}
        printingWeekly={printingWeekly}
        onExport={exportReport}
        onPrint={printWeeklySummary}
        canExport={canExportReports}
      />
    ),
  } as const;

  return (
    <PageShell spacing="default">
      <PageSection spacing="compact">
        <PageHeader
          title="Analytics & Intelligence"
          description="Review performance by period with focused financial and operations views."
          actions={
            <Button
              variant="outline"
              className="w-full sm:w-auto"
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
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (isReportTabKey(value)) {
              setActiveTab(value);
            }
          }}
        >
          <div className="overflow-x-auto pb-1">
            <TabsList>
              {REPORT_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {REPORT_TABS.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} spacing="roomy">
              {reportTabContent[tab.key]}
            </TabsContent>
          ))}
        </Tabs>
      </PageSection>
    </PageShell>
  );
}

export default withRoleGuard(ReportsPage, { all: [PERMISSION["reports.read"]] });
