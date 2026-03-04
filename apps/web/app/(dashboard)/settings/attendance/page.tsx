"use client";

import { AttendanceSettingsPage } from "@/components/config/attendance/attendance-settings-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function SettingsAttendancePage() {
  return <AttendanceSettingsPage />;
}

export default withRoleGuard(SettingsAttendancePage, {
  all: ["settings.read", "attendance.read"],
});
