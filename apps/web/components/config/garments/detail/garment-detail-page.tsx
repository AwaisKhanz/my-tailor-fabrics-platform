"use client";

import { useRouter } from "next/navigation";
import { GarmentAnalyticsStatsGrid } from "@/components/config/garments/detail/garment-analytics-stats-grid";
import { GarmentDetailBreadcrumb } from "@/components/config/garments/detail/garment-detail-breadcrumb";
import { GarmentDetailHeader } from "@/components/config/garments/detail/garment-detail-header";
import { GarmentDetailNotFound } from "@/components/config/garments/detail/garment-detail-not-found";
import { GarmentDetailSkeleton } from "@/components/config/garments/detail/garment-detail-skeleton";
import { GarmentMeasurementFormsCard } from "@/components/config/garments/detail/garment-measurement-forms-card";
import { GarmentOverviewCard } from "@/components/config/garments/detail/garment-overview-card";
import { GarmentPricingLogsCard } from "@/components/config/garments/detail/garment-pricing-logs-card";
import { GarmentPricingSidebar } from "@/components/config/garments/detail/garment-pricing-sidebar";
import { GarmentRatesSection } from "@/components/config/garments/detail/garment-rates-section";
import { useAuthz } from "@/hooks/use-authz";
import { useGarmentDetailPage } from "@/hooks/use-garment-detail-page";
import { GARMENTS_SETTINGS_ROUTE } from "@/lib/settings-routes";
import { PERMISSION } from "@tbms/shared-constants";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";

type GarmentDetailPageProps = {
  garmentId: string;
};

export function GarmentDetailPage({
  garmentId,
}: GarmentDetailPageProps) {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canManageRates = canAll([PERMISSION["rates.manage"]]);

  const {
    loading,
    garment,
    branches,
    createRateDialogOpen,
    setCreateRateDialogOpen,
    handleCreateRate,
  } = useGarmentDetailPage({
    garmentId,
  });

  if (loading) {
    return <GarmentDetailSkeleton />;
  }

  if (!garment) {
    return <GarmentDetailNotFound onBack={() => router.back()} />;
  }

  return (
    <PageShell>
      <PageSection spacing="compact">
        <GarmentDetailBreadcrumb
          garmentName={garment.name}
          onBack={() => router.push(GARMENTS_SETTINGS_ROUTE)}
        />
        <GarmentDetailHeader
          garment={garment}
          onOpenRates={() => setCreateRateDialogOpen(true)}
          canManageRates={canManageRates}
        />
      </PageSection>

      <PageSection spacing="compact">
        <GarmentAnalyticsStatsGrid garment={garment} />
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid grid-cols-1 gap-8 lg:grid-cols-5"
      >
        <div className="space-y-6 lg:col-span-3">
          <GarmentOverviewCard garment={garment} />
          <GarmentMeasurementFormsCard garment={garment} />
          <GarmentRatesSection
            garment={garment}
            branches={branches}
            open={createRateDialogOpen}
            onOpenChange={setCreateRateDialogOpen}
            onCreateRate={handleCreateRate}
            canManageRates={canManageRates}
          />
          <GarmentPricingLogsCard logs={garment.priceLogs || []} />
        </div>
        <aside className="space-y-6 lg:col-span-2">
          <GarmentPricingSidebar garment={garment} />
        </aside>
      </PageSection>
    </PageShell>
  );
}
