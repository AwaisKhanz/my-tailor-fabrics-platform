"use client";

import { IntegrationsSettingsPage } from "@/components/config/integrations/integrations-settings-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { Role } from "@tbms/shared-types";
import { PERMISSION } from '@tbms/shared-constants';

function SettingsIntegrationsPage() {
  return <IntegrationsSettingsPage />;
}

export default withRoleGuard(SettingsIntegrationsPage, {
  roles: [Role.SUPER_ADMIN],
  all: [PERMISSION["settings.read"], PERMISSION["mail.manage"]],
});
