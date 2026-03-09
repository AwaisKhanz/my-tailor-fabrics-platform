"use client";

import { MeasurementCategoryDetail } from "@/components/config/MeasurementCategoryDetail";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { useRequiredRouteParam } from "@/hooks/use-route-param";
import { MEASUREMENTS_SETTINGS_ROUTE } from "@/lib/settings-routes";

function MeasurementDetailPage() {
  const id = useRequiredRouteParam("id");

  return <MeasurementCategoryDetail id={id} />;
}

export default withRouteGuard(MeasurementDetailPage, MEASUREMENTS_SETTINGS_ROUTE);
