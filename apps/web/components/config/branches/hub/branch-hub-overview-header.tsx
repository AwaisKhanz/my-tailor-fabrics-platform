import { CalendarDays, MapPin, Phone as PhoneIcon } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

interface BranchHubOverviewHeaderProps {
  branch: BranchDetail | null;
}

export function BranchHubOverviewHeader({ branch }: BranchHubOverviewHeaderProps) {
  const createdAtLabel = branch?.createdAt ? formatDate(branch.createdAt) : undefined;

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardContent spacing="section" className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Branch Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
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

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {branch?.address ? (
                <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{branch.address}</span>
                </div>
              ) : null}

              {branch?.phone ? (
                <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                  <PhoneIcon className="h-3.5 w-3.5" />
                  <span>{branch.phone}</span>
                </div>
              ) : null}

              {createdAtLabel ? (
                <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Created {createdAtLabel}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
