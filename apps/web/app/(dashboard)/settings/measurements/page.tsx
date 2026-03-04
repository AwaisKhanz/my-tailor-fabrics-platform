"use client";

import { MeasurementCategoriesTable } from "@/components/config/MeasurementCategoriesTable";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function MeasurementsSettingsPage() {
  return <MeasurementCategoriesTable />;
}

export default withRoleGuard(MeasurementsSettingsPage, {
  all: ["settings.read", "measurements.read"],
});
