"use client";

import { MeasurementCategoriesTable } from "@/components/config/MeasurementCategoriesTable";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function MeasurementsSettingsPage() {
  return <MeasurementCategoriesTable />;
}

export default withRoleGuard(MeasurementsSettingsPage, {
  all: [PERMISSION["settings.read"], PERMISSION["measurements.read"]],
});
