"use client";

import { withRoleGuard } from "@/components/auth/with-role-guard";
import { ReportsPage } from "@/components/reports/reports-page";
import { PERMISSION } from "@tbms/shared-constants";

export default withRoleGuard(ReportsPage, {
  all: [PERMISSION["reports.read"]],
});
