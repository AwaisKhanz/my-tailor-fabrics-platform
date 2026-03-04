"use client";

import { UsersTable } from "@/components/config/UsersTable";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function UsersSettingsPage() {
  return <UsersTable />;
}

export default withRoleGuard(UsersSettingsPage, {
  all: ["settings.read", "users.manage"],
});
