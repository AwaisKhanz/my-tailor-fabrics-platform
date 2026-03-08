"use client";

import { IntegrationsSettingsPage } from "@/components/config/integrations/integrations-settings-page";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { Role } from "@tbms/shared-types";

function SettingsIntegrationsPage() {
  return <IntegrationsSettingsPage />;
}

export default withRouteGuard(SettingsIntegrationsPage, "/settings/integrations", {
  roles: [Role.SUPER_ADMIN],
});
