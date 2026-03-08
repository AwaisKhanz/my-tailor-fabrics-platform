"use client";

import { AttendanceSettingsPage } from "@/components/config/attendance/attendance-settings-page";
import { withRouteGuard } from "@/components/auth/with-role-guard";

function SettingsAttendancePage() {
  return <AttendanceSettingsPage />;
}

export default withRouteGuard(SettingsAttendancePage, "/settings/attendance");
