"use client";

import { withRoleGuard } from "@/components/auth/with-role-guard";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { PERMISSION } from "@tbms/shared-constants";

export default withRoleGuard(DashboardPage, { all: [PERMISSION["dashboard.read"]] });
