"use client";

import { AuditLogsPage } from "@/components/config/audit-logs/audit-logs-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function SettingsAuditLogsPage() {
  return <AuditLogsPage />;
}

export default withRoleGuard(SettingsAuditLogsPage, {
  all: [PERMISSION["settings.read"], PERMISSION["audit.read"]],
});
