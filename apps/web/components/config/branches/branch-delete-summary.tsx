import { AlertTriangle } from "lucide-react";
import { type Branch } from "@tbms/shared-types";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface BranchDeleteSummaryProps {
  branch: Branch | null;
}

function ImpactMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col rounded-md border border-border bg-background px-2 py-1.5 shadow-sm">
      <span className="text-xs font-bold text-foreground">{value}</span>
      <Label variant="dashboard" className="text-[9px]">
        {label}
      </Label>
    </div>
  );
}

export function BranchDeleteSummary({ branch }: BranchDeleteSummaryProps) {
  const employeesCount = branch?._count?.employees ?? 0;
  const customersCount = branch?._count?.customers ?? 0;
  const ordersCount = branch?._count?.orders ?? 0;

  return (
    <div className="space-y-4 pt-2">
      <Typography as="p" variant="body" className="font-medium leading-relaxed text-muted-foreground">
        Are you sure you want to delete{" "}
        <strong className="text-foreground">&quot;{branch?.name}&quot;</strong>? This action will hide
        the branch and deactivate it. Historic data will be preserved, but new operations will be
        blocked.
      </Typography>

      <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-3">
        <Label variant="dashboard">Linked Records Impact</Label>
        <div className="grid grid-cols-3 gap-2">
          <ImpactMetric label="Staff" value={employeesCount} />
          <ImpactMetric label="Clients" value={customersCount} />
          <ImpactMetric label="All Orders" value={ordersCount} />
        </div>
      </div>

      {ordersCount > 0 ? (
        <div className="rounded-lg border border-warning/20 bg-warning/10 p-3">
          <Typography
            as="p"
            variant="muted"
            className="flex items-start gap-1.5 text-xs font-bold leading-snug text-warning"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Warning: this branch has active orders. The system will block deletion until they are
            completed or cancelled.
          </Typography>
        </div>
      ) : null}
    </div>
  );
}
