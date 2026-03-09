"use client";

import { BranchHubConfig } from "@/components/config/BranchHubConfig";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { useRequiredRouteParam } from "@/hooks/use-route-param";
import { BRANCHES_SETTINGS_ROUTE } from "@/lib/settings-routes";

function BranchHubPage() {
  const branchId = useRequiredRouteParam("id");

  return <BranchHubConfig branchId={branchId} />;
}

export default withRouteGuard(BranchHubPage, BRANCHES_SETTINGS_ROUTE);
