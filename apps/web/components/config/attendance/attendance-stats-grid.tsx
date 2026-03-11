import { Activity, Clock3, Users } from "lucide-react";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";

interface AttendanceStatsGridProps {
  total: number;
  openShiftsOnPage: number;
  activeEmployees: number;
}

export function AttendanceStatsGrid({
  total,
  openShiftsOnPage,
  activeEmployees,
}: AttendanceStatsGridProps) {
  return (
    <StatsGrid columns="threeMd">
      <StatCard
        title="Attendance Records"
        subtitle="Total matching records"
        value={total.toLocaleString()}
        tone="primary"
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        title="Open Shifts"
        subtitle="Current page"
        value={openShiftsOnPage.toLocaleString()}
        tone="warning"
        icon={<Clock3 className="h-4 w-4" />}
      />
      <StatCard
        title="Active Employees"
        subtitle="Available for clock-in"
        value={activeEmployees.toLocaleString()}
        tone="success"
        icon={<Users className="h-4 w-4" />}
      />
    </StatsGrid>
  );
}
