import { MapPin, Phone as PhoneIcon } from "lucide-react";
import { type Branch } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

interface BranchHubOverviewHeaderProps {
  branch: Branch | null;
}

export function BranchHubOverviewHeader({ branch }: BranchHubOverviewHeaderProps) {
  return (
    <PageHeader
      title={branch?.name || "Branch Overview"}
      description={
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {branch?.address ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold">{branch.address}</span>
            </div>
          ) : null}
          {branch?.phone ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <PhoneIcon className="h-4 w-4 text-primary" />
              <span className="font-semibold">{branch.phone}</span>
            </div>
          ) : null}
        </div>
      }
      actions={
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <Badge variant={branch?.isActive ? "success" : "outline"} size="xs">
            {branch?.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="secondary" size="xs">
            {branch?.code}
          </Badge>
        </div>
      }
    />
  );
}
