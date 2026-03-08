"use client";

import { BranchesTable } from "@/components/config/BranchesTable";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function BranchesSettingsPage() {
  return <BranchesTable />;
}

export default withRoleGuard(BranchesSettingsPage, {
  all: [PERMISSION["settings.read"], PERMISSION["branches.read"]],
});
