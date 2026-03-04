"use client";

import { SystemSettingsPage } from "@/components/config/system/system-settings-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function SettingsSystemPage() {
  return <SystemSettingsPage />;
}

export default withRoleGuard(SettingsSystemPage, {
  all: ["settings.read", "system.manage"],
});
