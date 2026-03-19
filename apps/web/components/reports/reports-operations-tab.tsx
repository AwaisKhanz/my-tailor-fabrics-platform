import type { ProductivityPoint, ReportDistributions } from "@tbms/shared-types";
import { ReportsDistributionChart } from "@/components/reports/reports-distribution-chart";
import { ReportsProductivityChart } from "@/components/reports/reports-productivity-chart";
import { formatPKR } from "@/lib/utils";

interface ReportsOperationsTabProps {
  loading: boolean;
  distributions: ReportDistributions | null;
  productivity: ProductivityPoint[];
}

export function ReportsOperationsTab({
  loading,
  distributions,
  productivity,
}: ReportsOperationsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ReportsDistributionChart
          loading={loading}
          title="Design Demand"
          description="Non-cancelled booked design contribution by design type."
          points={distributions?.designs ?? []}
          mode="bar"
          valueFormatter={(value) => formatPKR(value)}
        />

        <ReportsDistributionChart
          loading={loading}
          title="Addon Contribution"
          description="Non-cancelled addon contribution across selected orders."
          points={distributions?.addons ?? []}
          mode="donut"
          valueFormatter={(value) => formatPKR(value)}
        />
      </div>

      <ReportsProductivityChart loading={loading} points={productivity} />
    </div>
  );
}
