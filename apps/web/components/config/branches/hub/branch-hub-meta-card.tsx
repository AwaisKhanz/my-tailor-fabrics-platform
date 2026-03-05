import { Building2, CalendarDays, MapPin, Phone } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import { Typography } from "@/components/ui/typography";
import { formatDate } from "@/lib/utils";

interface BranchHubMetaCardProps {
  branch: BranchDetail | null;
}

export function BranchHubMetaCard({ branch }: BranchHubMetaCardProps) {
  return (
    <Card variant="elevatedPanel">
      <CardHeader variant="rowSection" align="startResponsive">
        <div className="flex items-center gap-2">
          <SectionIcon>
            <Building2 className="h-4 w-4" />
          </SectionIcon>
          <CardTitle variant="section">Branch Profile</CardTitle>
        </div>
        <Badge variant={branch?.isActive ? "success" : "outline"} size="xs">
          {branch?.isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-4">
        <InfoTile tone={"elevatedSoft"}>
          <Label variant="micro">Branch ID</Label>
          <Typography
            as="p"
            variant="body"
            className="mt-1 truncate text-sm font-semibold text-text-primary"
          >
            {branch?.id || "N/A"}
          </Typography>
        </InfoTile>

        <InfoTile tone={"elevatedSoft"}>
          <Label variant="micro">Branch Code</Label>
          <Typography
            as="p"
            variant="body"
            className="mt-1 text-sm font-semibold uppercase text-text-primary"
          >
            {branch?.code || "N/A"}
          </Typography>
        </InfoTile>

        <InfoTile padding="md" tone={"elevatedSoft"} className=" space-y-2">
          <div className="flex items-start gap-3 text-sm text-text-secondary">
            <MapPin className="mt-0.5 h-4 w-4 text-text-secondary" />
            <span>{branch?.address || "No address provided yet."}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <Phone className="h-4 w-4 text-text-secondary" />
            <span>{branch?.phone || "No phone provided yet."}</span>
          </div>
        </InfoTile>

        <div className="grid grid-cols-1 gap-3 border-t border-divider  sm:grid-cols-2">
          <InfoTile padding="md" tone={"elevatedSoft"}>
            <Label variant="dashboard">Created</Label>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
              <CalendarDays className="h-3.5 w-3.5 text-text-secondary" />
              <span>
                {branch?.createdAt ? formatDate(branch.createdAt) : "N/A"}
              </span>
            </div>
          </InfoTile>
          <InfoTile padding="md" tone={"elevatedSoft"}>
            <Label variant="dashboard">Last Updated</Label>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
              <CalendarDays className="h-3.5 w-3.5 text-text-secondary" />
              <span>
                {branch?.updatedAt ? formatDate(branch.updatedAt) : "N/A"}
              </span>
            </div>
          </InfoTile>
        </div>
      </CardContent>
    </Card>
  );
}
