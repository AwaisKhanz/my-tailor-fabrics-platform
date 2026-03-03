"use client";

import { useParams, useRouter } from "next/navigation";
import { GarmentAnalyticsStatsGrid } from "@/components/config/garments/detail/garment-analytics-stats-grid";
import { GarmentDetailHeader } from "@/components/config/garments/detail/garment-detail-header";
import { GarmentDetailNotFound } from "@/components/config/garments/detail/garment-detail-not-found";
import { GarmentDetailSkeleton } from "@/components/config/garments/detail/garment-detail-skeleton";
import { GarmentMeasurementFormsCard } from "@/components/config/garments/detail/garment-measurement-forms-card";
import { GarmentOverviewCard } from "@/components/config/garments/detail/garment-overview-card";
import { GarmentPricingLogsCard } from "@/components/config/garments/detail/garment-pricing-logs-card";
import { GarmentPricingSidebar } from "@/components/config/garments/detail/garment-pricing-sidebar";
import { GarmentRatesSection } from "@/components/config/garments/detail/garment-rates-section";
import { useGarmentDetailPage } from "@/hooks/use-garment-detail-page";

export default function GarmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

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
    <div className="space-y-6">
      <GarmentDetailHeader garment={garment} onBack={() => router.back()} />

      <GarmentAnalyticsStatsGrid garment={garment} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <GarmentOverviewCard garment={garment} />
          <GarmentMeasurementFormsCard garment={garment} />
          <GarmentPricingLogsCard logs={garment.priceLogs || []} />
        </div>

        <div>
          <GarmentPricingSidebar garment={garment} />
        </div>
      </div>

      <GarmentRatesSection
        garment={garment}
        branches={branches}
        open={createRateDialogOpen}
        onOpenChange={setCreateRateDialogOpen}
        onCreateRate={handleCreateRate}
      />
    </div>
  );
}
