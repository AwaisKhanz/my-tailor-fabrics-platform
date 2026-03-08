"use client";

import { UsersTable } from "@/components/config/UsersTable";
import { withRouteGuard } from "@/components/auth/with-role-guard";

function UsersSettingsPage() {
  return <UsersTable />;
}

export default withRouteGuard(UsersSettingsPage, "/settings/users");
