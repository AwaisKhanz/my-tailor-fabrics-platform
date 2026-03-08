"use client";

import { GarmentTypesTable } from "@/components/config/GarmentTypesTable";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function GarmentsSettingsPage() {
  return <GarmentTypesTable />;
}

export default withRoleGuard(GarmentsSettingsPage, {
  all: [PERMISSION["settings.read"], PERMISSION["garments.read"]],
});
