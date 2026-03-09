"use client";

import { AuditLogsPage } from "@/components/config/audit-logs/audit-logs-page";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { AUDIT_LOGS_SETTINGS_ROUTE } from "@/lib/settings-routes";

function SettingsAuditLogsPage() {
  return <AuditLogsPage />;
}

export default withRouteGuard(SettingsAuditLogsPage, AUDIT_LOGS_SETTINGS_ROUTE);
