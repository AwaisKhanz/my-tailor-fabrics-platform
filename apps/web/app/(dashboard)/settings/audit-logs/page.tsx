"use client";

import { AuditLogsPage } from "@/components/config/audit-logs/audit-logs-page";
import { withRouteGuard } from "@/components/auth/with-role-guard";

function SettingsAuditLogsPage() {
  return <AuditLogsPage />;
}

export default withRouteGuard(SettingsAuditLogsPage, "/settings/audit-logs");
