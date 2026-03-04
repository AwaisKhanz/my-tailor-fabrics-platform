"use client";

import { GarmentTypesTable } from "@/components/config/GarmentTypesTable";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function GarmentsSettingsPage() {
  return <GarmentTypesTable />;
}

export default withRoleGuard(GarmentsSettingsPage, {
  all: ["settings.read", "garments.read"],
});
