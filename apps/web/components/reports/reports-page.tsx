"use client";

import { Card, CardContent } from "@tbms/ui/components/card";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tbms/ui/components/tabs";
import { ReportsExportsTab } from "@/components/reports/reports-exports-tab";
import { ReportsFinancialTab } from "@/components/reports/reports-financial-tab";
import { ReportsOperationsTab } from "@/components/reports/reports-operations-tab";
import { ReportsOverviewTab } from "@/components/reports/reports-overview-tab";
import { ReportsPageHeader } from "@/components/reports/reports-page-header";
import { ReportsWorkspaceFilters } from "@/components/reports/reports-workspace-filters";
import { useReportsWorkspace } from "@/hooks/use-reports-workspace";
import { useAuthz } from "@/hooks/use-authz";
import { PERMISSION } from "@tbms/shared-constants";

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

export function ReportsPage() {
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
    <PageShell>
      <PageSection spacing="compact">
        <ReportsPageHeader
          loading={loading}
          onRefresh={() => {
            void refreshAnalytics();
          }}
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
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-5">
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                if (isReportTabKey(value)) {
                  setActiveTab(value);
                }
              }}
              className={"flex flex-col"}
            >
              <div className="overflow-x-auto pb-3">
                <TabsList content="sd">
                  {REPORT_TABS.map((tab) => (
                    <TabsTrigger key={tab.key} value={tab.key}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {REPORT_TABS.map((tab) => (
                <TabsContent key={tab.key} value={tab.key}>
                  {reportTabContent[tab.key]}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </PageSection>
    </PageShell>
  );
}
