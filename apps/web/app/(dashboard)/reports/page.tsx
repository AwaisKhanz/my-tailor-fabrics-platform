"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Typography } from "@/components/ui/typography";
import { ReportsDateRangeCard } from "@/components/reports/reports-date-range-card";
import { ReportsExportGrid } from "@/components/reports/reports-export-grid";
import { ReportsInsightsSection } from "@/components/reports/reports-insights-section";
import { ReportsWeeklyPrintCard } from "@/components/reports/reports-weekly-print-card";
import { useReportsPage } from "@/hooks/use-reports-page";

export default function ReportsPage() {
  const {
    loading,
    summary,
    dateRange,
    exportingKey,
    printingWeekly,
    setDateRangeValue,
    refreshAnalytics,
    exportReport,
    printWeeklySummary,
  } = useReportsPage();

  return (
    <div className="mx-auto max-w-9xl space-y-8 pb-12">
      <PageHeader
        title="Analytics & Intelligence"
        description="Global business performance and design popularity insights."
        actions={
          <Button
            variant="outline"
            className="border-primary/20 font-bold text-primary hover:bg-primary/5"
            onClick={refreshAnalytics}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Feed"}
          </Button>
        }
      />

      <ReportsDateRangeCard
        from={dateRange.from}
        to={dateRange.to}
        onFromChange={(value) => setDateRangeValue("from", value)}
        onToChange={(value) => setDateRangeValue("to", value)}
      />

      <ReportsInsightsSection loading={loading} summary={summary} />

      <div className="mt-12 space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <Typography as="h2" variant="sectionTitle">
            Document Exports
          </Typography>
        </div>

        <ReportsExportGrid exportingKey={exportingKey} onExport={exportReport} />
        <ReportsWeeklyPrintCard printing={printingWeekly} onPrint={printWeeklySummary} />
      </div>
    </div>
  );
}
