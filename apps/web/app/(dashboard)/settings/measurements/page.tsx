"use client";

import { MeasurementCategoriesTable } from "@/components/config/MeasurementCategoriesTable";
import { withRouteGuard } from "@/components/auth/with-role-guard";

function MeasurementsSettingsPage() {
  return <MeasurementCategoriesTable />;
}

export default withRouteGuard(
  MeasurementsSettingsPage,
  "/settings/measurements",
);
