import { RefreshCw } from "lucide-react";
import { ActionStrip } from "@tbms/ui/components/action-strip";
import { Button } from "@tbms/ui/components/button";
import { InlineLoader } from "@tbms/ui/components/inline-loader";
import { PageHeader } from "@tbms/ui/components/page-header";

interface ReportsPageHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export function ReportsPageHeader({
  loading,
  onRefresh,
}: ReportsPageHeaderProps) {
  return (
    <PageHeader
      title="Analytics & Intelligence"
      description="Review performance by period with focused financial and operations views."
      actions={
        <ActionStrip>
          <Button variant="outline" onClick={onRefresh} disabled={loading}>
            {loading ? (
              <InlineLoader label="Refreshing reports" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {loading ? "Refreshing..." : "Refresh Feed"}
          </Button>
        </ActionStrip>
      }
    />
  );
}
