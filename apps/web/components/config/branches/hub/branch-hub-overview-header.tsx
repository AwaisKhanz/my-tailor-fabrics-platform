import { CalendarDays, MapPin, Phone as PhoneIcon } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MetaPill } from "@/components/ui/meta-pill";
import { formatDate } from "@/lib/utils";

interface BranchHubOverviewHeaderProps {
  branch: BranchDetail | null;
}

export function BranchHubOverviewHeader({ branch }: BranchHubOverviewHeaderProps) {
  const createdAtLabel = branch?.createdAt ? formatDate(branch.createdAt) : undefined;

  return (
    <Card variant="shell">
      <CardContent spacing="section" className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Label variant="microStrong">
              Branch Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                {branch?.name || "Branch Overview"}
              </h1>
              <Badge
                variant={branch?.isActive ? "success" : "outline"}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
              >
                {branch?.isActive ? "Active" : "Inactive"}
              </Badge>
              {branch?.code ? (
                <Badge variant="outline" size="xs" className="font-semibold uppercase">
                  {branch.code}
                </Badge>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 text-xs text-text-secondary sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {branch?.address ? (
                <MetaPill>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{branch.address}</span>
                </MetaPill>
              ) : null}

              {branch?.phone ? (
                <MetaPill>
                  <PhoneIcon className="h-3.5 w-3.5" />
                  <span>{branch.phone}</span>
                </MetaPill>
              ) : null}

              {createdAtLabel ? (
                <MetaPill>
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Created {createdAtLabel}</span>
                </MetaPill>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
