import { RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";

interface AuditLogsPageHeaderProps {
  onRefresh: () => void;
}

export function AuditLogsPageHeader({ onRefresh }: AuditLogsPageHeaderProps) {
  return (
    <PageHeader
      title="Audit Logs"
      description={
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          Track security and data changes across users, entities, and actions.
        </span>
      }
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
