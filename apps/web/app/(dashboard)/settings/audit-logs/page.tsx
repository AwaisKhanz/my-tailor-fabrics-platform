"use client";

import { AuditLogsPage } from "@/components/config/audit-logs/audit-logs-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function SettingsAuditLogsPage() {
  return <AuditLogsPage />;
}

export default withRoleGuard(SettingsAuditLogsPage, {
  all: ["settings.read", "audit.read"],
});
