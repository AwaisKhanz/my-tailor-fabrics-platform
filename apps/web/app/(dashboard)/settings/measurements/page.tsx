"use client";

import { MeasurementCategoriesTable } from "@/components/config/MeasurementCategoriesTable";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { MEASUREMENTS_SETTINGS_ROUTE } from "@/lib/settings-routes";

function MeasurementsSettingsPage() {
  return <MeasurementCategoriesTable />;
}

export default withRouteGuard(
  MeasurementsSettingsPage,
  MEASUREMENTS_SETTINGS_ROUTE,
);
