"use client";

import { GarmentTypesTable } from "@/components/config/GarmentTypesTable";
import { withRouteGuard } from "@/components/auth/with-role-guard";

function GarmentsSettingsPage() {
  return <GarmentTypesTable />;
}

export default withRouteGuard(GarmentsSettingsPage, "/settings/garments");
