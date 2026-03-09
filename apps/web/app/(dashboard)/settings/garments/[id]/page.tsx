"use client";

import { GarmentDetailPage } from "@/components/config/garments/detail/garment-detail-page";
import { useRequiredRouteParam } from "@/hooks/use-route-param";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { GARMENTS_SETTINGS_ROUTE } from "@/lib/settings-routes";
function GarmentDetailRoutePage() {
  const garmentId = useRequiredRouteParam("id");

  return garmentId ? <GarmentDetailPage garmentId={garmentId} /> : null;
}

export default withRouteGuard(GarmentDetailRoutePage, GARMENTS_SETTINGS_ROUTE);
