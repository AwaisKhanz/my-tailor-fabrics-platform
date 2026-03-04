"use client";

import { AppearanceSettingsPage } from "@/components/config/appearance/appearance-settings-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function AppearancePage() {
  return <AppearanceSettingsPage />;
}

export default withRoleGuard(AppearancePage, {
  all: ["settings.read", "appearance.manage"],
});
