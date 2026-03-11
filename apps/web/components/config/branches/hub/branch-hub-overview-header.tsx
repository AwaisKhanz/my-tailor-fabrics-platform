import { CalendarDays, MapPin, Phone as PhoneIcon } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { PageHeader } from "@tbms/ui/components/page-header";
import { formatDate } from "@/lib/utils";

interface BranchHubOverviewHeaderProps {
  branch: BranchDetail | null;
}

export function BranchHubOverviewHeader({
  branch,
}: BranchHubOverviewHeaderProps) {
  const createdAtLabel = branch?.createdAt
    ? formatDate(branch.createdAt)
    : undefined;

  return (
    <div className="space-y-3">
      <PageHeader
        title={branch?.name || "Branch Overview"}
        description="Branch command center for profile data, relations, and pricing coverage."
      />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={branch?.isActive ? "default" : "outline"}>
          {branch?.isActive ? "Active" : "Inactive"}
        </Badge>
        {branch?.code ? <Badge variant="outline">{branch.code}</Badge> : null}
        {branch?.address ? (
          <Badge variant="outline" className="gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {branch.address}
          </Badge>
        ) : null}
        {branch?.phone ? (
          <Badge variant="outline" className="gap-1">
            <PhoneIcon className="h-3.5 w-3.5" />
            {branch.phone}
          </Badge>
        ) : null}
        {createdAtLabel ? (
          <Badge variant="outline" className="gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            Created {createdAtLabel}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
