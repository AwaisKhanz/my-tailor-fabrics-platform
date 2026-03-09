"use client";

import { SystemSettingsPage } from "@/components/config/system/system-settings-page";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { SYSTEM_SETTINGS_ROUTE } from "@/lib/settings-routes";

function SettingsSystemPage() {
  return <SystemSettingsPage />;
}

export default withRouteGuard(SettingsSystemPage, SYSTEM_SETTINGS_ROUTE);
