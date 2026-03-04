"use client";

import { IntegrationsSettingsPage } from "@/components/config/integrations/integrations-settings-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { Role } from "@tbms/shared-types";

function SettingsIntegrationsPage() {
  return <IntegrationsSettingsPage />;
}

export default withRoleGuard(SettingsIntegrationsPage, {
  roles: [Role.SUPER_ADMIN],
  all: ["settings.read", "mail.manage"],
});
