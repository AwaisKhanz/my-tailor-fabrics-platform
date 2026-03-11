import { AlertTriangle } from "lucide-react";
import { type Branch } from "@tbms/shared-types";
import { FieldLabel } from "@tbms/ui/components/field";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { Text } from "@tbms/ui/components/typography";

interface BranchDeleteSummaryProps {
  branch: Branch | null;
}

function ImpactMetric({ label, value }: { label: string; value: number }) {
  return (
    <InfoTile tone="secondary" padding="xs" className="flex-col rounded-md">
      <span className="text-xs font-bold text-foreground">{value}</span>
      <FieldLabel size="compact">{label}</FieldLabel>
    </InfoTile>
  );
}

export function BranchDeleteSummary({ branch }: BranchDeleteSummaryProps) {
  const employeesCount = branch?._count?.employees ?? 0;
  const customersCount = branch?._count?.customers ?? 0;
  const ordersCount = branch?._count?.orders ?? 0;

  return (
    <div className="space-y-4 pt-2">
      <Text
        as="p"
        variant="body"
        className="font-medium leading-relaxed text-muted-foreground"
      >
        Are you sure you want to delete{" "}
        <strong className="text-foreground">&quot;{branch?.name}&quot;</strong>?
        This action will hide the branch and deactivate it. Historic data will
        be preserved, but new operations will be blocked.
      </Text>

      <InfoTile padding="content" className="space-y-2">
        <FieldLabel>Linked Records Impact</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          <ImpactMetric label="Staff" value={employeesCount} />
          <ImpactMetric label="Clients" value={customersCount} />
          <ImpactMetric label="All Orders" value={ordersCount} />
        </div>
      </InfoTile>

      {ordersCount > 0 ? (
        <InfoTile tone="warning" padding="content">
          <Text
            as="p"
            variant="muted"
            className="flex items-start gap-1.5 text-xs font-bold leading-snug text-secondary-foreground"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Warning: this branch has active orders. The system will block
            deletion until they are completed or cancelled.
          </Text>
        </InfoTile>
      ) : null}
    </div>
  );
}
