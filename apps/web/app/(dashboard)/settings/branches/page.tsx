"use client";

import { BranchesTable } from "@/components/config/BranchesTable";
import { withRouteGuard } from "@/components/auth/with-role-guard";

function BranchesSettingsPage() {
  return <BranchesTable />;
}

export default withRouteGuard(BranchesSettingsPage, "/settings/branches");
