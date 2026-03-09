"use client";

import { IntegrationsSettingsPage } from "@/components/config/integrations/integrations-settings-page";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { Role } from "@tbms/shared-types";
import { INTEGRATIONS_SETTINGS_ROUTE } from "@/lib/settings-routes";

function SettingsIntegrationsPage() {
  return <IntegrationsSettingsPage />;
}

export default withRouteGuard(SettingsIntegrationsPage, INTEGRATIONS_SETTINGS_ROUTE, {
  roles: [Role.SUPER_ADMIN],
});
