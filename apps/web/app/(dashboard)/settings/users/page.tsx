"use client";

import { UsersTable } from "@/components/config/UsersTable";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { USERS_SETTINGS_ROUTE } from "@/lib/settings-routes";

function UsersSettingsPage() {
  return <UsersTable />;
}

export default withRouteGuard(UsersSettingsPage, USERS_SETTINGS_ROUTE);
