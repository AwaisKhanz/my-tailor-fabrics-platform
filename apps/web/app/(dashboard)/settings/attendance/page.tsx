"use client";

import { AttendanceSettingsPage } from "@/components/config/attendance/attendance-settings-page";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { ATTENDANCE_SETTINGS_ROUTE } from "@/lib/settings-routes";

function SettingsAttendancePage() {
  return <AttendanceSettingsPage />;
}

export default withRouteGuard(SettingsAttendancePage, ATTENDANCE_SETTINGS_ROUTE);
