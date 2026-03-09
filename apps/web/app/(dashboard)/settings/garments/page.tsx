"use client";

import { GarmentTypesTable } from "@/components/config/GarmentTypesTable";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { GARMENTS_SETTINGS_ROUTE } from "@/lib/settings-routes";

function GarmentsSettingsPage() {
  return <GarmentTypesTable />;
}

export default withRouteGuard(GarmentsSettingsPage, GARMENTS_SETTINGS_ROUTE);
