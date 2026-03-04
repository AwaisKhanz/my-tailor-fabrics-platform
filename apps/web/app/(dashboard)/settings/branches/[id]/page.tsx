"use client";

import React from "react";
import { useParams } from "next/navigation";
import { BranchHubConfig } from "@/components/config/BranchHubConfig";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function BranchHubPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <BranchHubConfig branchId={id} />
  );
}

export default withRoleGuard(BranchHubPage, {
  all: ["settings.read", "branches.read"],
});
