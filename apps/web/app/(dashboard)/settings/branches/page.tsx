"use client";

import { BranchesTable } from "@/components/config/BranchesTable";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { BRANCHES_SETTINGS_ROUTE } from "@/lib/settings-routes";

function BranchesSettingsPage() {
  return <BranchesTable />;
}

export default withRouteGuard(BranchesSettingsPage, BRANCHES_SETTINGS_ROUTE);
