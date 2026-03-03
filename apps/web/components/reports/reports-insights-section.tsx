import { BarChart3 } from "lucide-react";
import { type ReportSummary } from "@/lib/api/reports";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { DesignAnalyticsCharts } from "@/components/reports/DesignAnalyticsCharts";

interface ReportsInsightsSectionProps {
  loading: boolean;
  summary: ReportSummary | null;
}

export function ReportsInsightsSection({
  loading,
  summary,
}: ReportsInsightsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <Typography as="h2" variant="sectionTitle">
          Live Insights Breakdown
        </Typography>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px] rounded-3xl" />
          <Skeleton className="h-[300px] rounded-3xl" />
        </div>
      ) : summary ? (
        <DesignAnalyticsCharts
          designs={summary.designs}
          addons={summary.addons}
          totalDesignRevenue={summary.totalDesignRevenue}
          totalAddonRevenue={summary.totalAddonRevenue}
        />
      ) : null}
    </div>
  );
}
