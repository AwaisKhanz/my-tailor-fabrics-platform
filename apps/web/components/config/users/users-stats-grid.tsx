import { ShieldAlert, Monitor, UserCheck } from "lucide-react";
import { type UserStatsSummary } from "@tbms/shared-types";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface UsersStatsGridProps {
  stats: UserStatsSummary;
}

export function UsersStatsGrid({ stats }: UsersStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm md:gap-5 md:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted md:h-14 md:w-14">
          <UserCheck className="h-6 w-6 text-primary md:h-7 md:w-7" />
        </div>
        <div>
          <Label variant="dashboard" className="mb-1">
            Active Accounts
          </Label>
          <div className="flex items-end gap-3">
            <Typography as="p" variant="statValue" className="leading-none md:text-3xl">
              {stats.active}
            </Typography>
            <span className="rounded-lg bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
              Secure
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm md:gap-5 md:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted md:h-14 md:w-14">
          <ShieldAlert className="h-6 w-6 text-primary md:h-7 md:w-7" />
        </div>
        <div>
          <Label variant="dashboard" className="mb-1">
            Privileged Roles
          </Label>
          <div className="flex flex-col">
            <Typography as="p" variant="statValue" className="leading-none md:text-3xl">
              {stats.privileged} Users
            </Typography>
            <Label variant="dashboard" className="mt-1.5">
              Admins & Operators
            </Label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm md:gap-5 md:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted md:h-14 md:w-14">
          <Monitor className="h-6 w-6 text-primary md:h-7 md:w-7" />
        </div>
        <div>
          <Label variant="dashboard" className="mb-1">
            System Health
          </Label>
          <div className="flex flex-col">
            <Typography as="p" variant="statValue" className="leading-none md:text-3xl">
              100%
            </Typography>
            <Label variant="dashboard" className="mt-1.5">
              Live Access Control
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
