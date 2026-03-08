"use client";

import { SystemSettingsPage } from "@/components/config/system/system-settings-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function SettingsSystemPage() {
  return <SystemSettingsPage />;
}

export default withRoleGuard(SettingsSystemPage, {
  all: [PERMISSION["settings.read"], PERMISSION["system.manage"]],
});
