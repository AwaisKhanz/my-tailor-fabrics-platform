import { RefreshCcw } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";

interface AttendanceSettingsPageHeaderProps {
  onRefresh: () => void;
}

export function AttendanceSettingsPageHeader({
  onRefresh,
}: AttendanceSettingsPageHeaderProps) {
  return (
    <PageHeader
      title="Attendance Control"
      description="Monitor shifts, clock employees in, and resolve active attendance sessions."
      actions={
        <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      }
      surface="card"
      density="compact"
    />
  );
}
