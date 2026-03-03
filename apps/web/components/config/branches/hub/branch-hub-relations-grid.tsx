import type { ReactNode } from "react";
import { Briefcase, Users } from "lucide-react";
import { type Branch } from "@tbms/shared-types";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface BranchHubRelationsGridProps {
  branch: Branch | null;
}

interface BranchStatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  className?: string;
}

function BranchStatCard({ label, value, icon, className }: BranchStatCardProps) {
  return (
    <div className={className}>
      {icon}
      <div className="flex flex-col">
        <Label variant="dashboard" className="mb-0.5">
          {label}
        </Label>
        <Typography as="p" variant="statValue" className="text-xl">
          {value}
        </Typography>
      </div>
    </div>
  );
}

export function BranchHubRelationsGrid({ branch }: BranchHubRelationsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
      <BranchStatCard
        label="Employees"
        value={branch?._count?.employees || 0}
        className="flex items-center gap-4 border-b border-border pb-4 pr-6 sm:border-b-0 sm:border-r sm:pb-0"
        icon={
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-chart-1/20 bg-chart-1/10">
            <Users className="h-6 w-6 text-chart-1" />
          </div>
        }
      />

      <BranchStatCard
        label="Customers"
        value={branch?._count?.customers || 0}
        className="flex items-center gap-4 border-b border-border pb-4 sm:border-b-0 sm:pl-4 lg:border-r lg:pr-4"
        icon={
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
            <Users className="h-5 w-5 text-chart-2" />
          </div>
        }
      />

      <BranchStatCard
        label="Orders"
        value={branch?._count?.orders || 0}
        className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-6"
        icon={
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
        }
      />
    </div>
  );
}
