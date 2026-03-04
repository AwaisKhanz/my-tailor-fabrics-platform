import { AlertTriangle } from "lucide-react";
import { type Branch } from "@tbms/shared-types";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface BranchDeleteSummaryProps {
  branch: Branch | null;
}

function ImpactMetric({ label, value }: { label: string; value: number }) {
  return (
    <InfoTile tone="surface" padding="xs" className="flex-col rounded-md">
      <span className="text-xs font-bold text-text-primary">{value}</span>
      <Label variant="dashboard" className="text-[9px]">
        {label}
      </Label>
    </InfoTile>
  );
}

export function BranchDeleteSummary({ branch }: BranchDeleteSummaryProps) {
  const employeesCount = branch?._count?.employees ?? 0;
  const customersCount = branch?._count?.customers ?? 0;
  const ordersCount = branch?._count?.orders ?? 0;

  return (
    <div className="space-y-4 pt-2">
      <Typography as="p" variant="body" className="font-medium leading-relaxed text-text-secondary">
        Are you sure you want to delete{" "}
        <strong className="text-text-primary">&quot;{branch?.name}&quot;</strong>? This action will hide
        the branch and deactivate it. Historic data will be preserved, but new operations will be
        blocked.
      </Typography>

      <InfoTile padding="content" className="space-y-2">
        <Label variant="dashboard">Linked Records Impact</Label>
        <div className="grid grid-cols-3 gap-2">
          <ImpactMetric label="Staff" value={employeesCount} />
          <ImpactMetric label="Clients" value={customersCount} />
          <ImpactMetric label="All Orders" value={ordersCount} />
        </div>
      </InfoTile>

      {ordersCount > 0 ? (
        <InfoTile tone="warning" padding="content">
          <Typography
            as="p"
            variant="muted"
            className="flex items-start gap-1.5 text-xs font-bold leading-snug text-warning"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Warning: this branch has active orders. The system will block deletion until they are
            completed or cancelled.
          </Typography>
        </InfoTile>
      ) : null}
    </div>
  );
}
