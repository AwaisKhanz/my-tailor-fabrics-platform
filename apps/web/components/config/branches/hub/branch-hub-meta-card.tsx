import { Building2, CalendarDays, MapPin, Phone } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { formatDate } from "@/lib/utils";

interface BranchHubMetaCardProps {
  branch: BranchDetail | null;
}

export function BranchHubMetaCard({ branch }: BranchHubMetaCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div className="space-y-1">
            <CardTitle className="text-base">Branch Profile</CardTitle>
            <CardDescription>Identity and metadata</CardDescription>
          </div>
        </div>
        <Badge variant={branch?.isActive ? "default" : "outline"}>
          {branch?.isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted/40 px-3 py-3">
          <p className="text-xs text-muted-foreground">Branch ID</p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">
            {branch?.id || "N/A"}
          </p>
        </div>

        <div className="rounded-md bg-muted/40 px-3 py-3">
          <p className="text-xs text-muted-foreground">Branch Code</p>
          <p className="mt-1 text-sm font-semibold uppercase text-foreground">
            {branch?.code || "N/A"}
          </p>
        </div>

        <div className="space-y-2 rounded-md bg-muted/40 px-3 py-3">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span>{branch?.address || "No address provided yet."}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{branch?.phone || "No phone provided yet."}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-muted/40 px-3 py-3">
            <p className="text-xs text-muted-foreground">Created</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {branch?.createdAt ? formatDate(branch.createdAt) : "N/A"}
              </span>
            </div>
          </div>
          <div className="rounded-md bg-muted/40 px-3 py-3">
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {branch?.updatedAt ? formatDate(branch.updatedAt) : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
