"use client";

import { useParams } from "next/navigation";
import { BranchHubConfig } from "@/components/config/BranchHubConfig";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function BranchHubPage() {
  const params = useParams<{ id: string }>();
  const branchId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <BranchHubConfig branchId={branchId} />;
}

export default withRoleGuard(BranchHubPage, {
  all: [PERMISSION["settings.read"], PERMISSION["branches.read"]],
});
