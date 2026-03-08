"use client";

import { UsersTable } from "@/components/config/UsersTable";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function UsersSettingsPage() {
  return <UsersTable />;
}

export default withRoleGuard(UsersSettingsPage, {
  all: [PERMISSION["settings.read"], PERMISSION["users.manage"]],
});
