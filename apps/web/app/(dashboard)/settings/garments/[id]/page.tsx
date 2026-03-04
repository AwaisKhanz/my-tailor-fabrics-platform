"use client";

import { useParams, useRouter } from "next/navigation";
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
import { DetailSplit, PageShell, PageSection } from "@/components/ui/page-shell";
import { useAuthz } from "@/hooks/use-authz";
import { useGarmentDetailPage } from "@/hooks/use-garment-detail-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function GarmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { canAll } = useAuthz();
  const canManageRates = canAll(["rates.manage"]);

  const garmentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    loading,
    garment,
    branches,
    createRateDialogOpen,
    setCreateRateDialogOpen,
    handleCreateRate,
  } = useGarmentDetailPage({
    garmentId: garmentId ?? null,
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
          onBack={() => router.push("/settings/garments")}
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

      <PageSection spacing="compact">
        <DetailSplit
          ratio="3-2"
          gap="spacious"
          main={
            <PageSection spacing="compact">
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
            </PageSection>
          }
          side={<GarmentPricingSidebar garment={garment} />}
        />
      </PageSection>
    </PageShell>
  );
}

export default withRoleGuard(GarmentDetailPage, {
  all: ["settings.read", "garments.read"],
});
