"use client";

import { BranchesTable } from "@/components/config/BranchesTable";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function BranchesSettingsPage() {
  return <BranchesTable />;
}

export default withRoleGuard(BranchesSettingsPage, {
  all: ["settings.read", "branches.read"],
});
