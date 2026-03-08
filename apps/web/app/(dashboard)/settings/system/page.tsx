"use client";

import { SystemSettingsPage } from "@/components/config/system/system-settings-page";
import { withRouteGuard } from "@/components/auth/with-role-guard";

function SettingsSystemPage() {
  return <SystemSettingsPage />;
}

export default withRouteGuard(SettingsSystemPage, "/settings/system");
