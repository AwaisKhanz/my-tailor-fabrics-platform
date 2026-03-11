import { Building2, CalendarDays, MapPin, Phone } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { InfoTile } from "@/components/ui/info-tile";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { Text } from "@/components/ui/typography";
import { formatDate } from "@/lib/utils";

interface BranchHubMetaCardProps {
  branch: BranchDetail | null;
}

export function BranchHubMetaCard({ branch }: BranchHubMetaCardProps) {
  return (
    <Card>
      <CardHeader
        layout="rowBetweenResponsive"
        surface="mutedSection"
        trimBottom
      >
        <SectionHeader
          title="Branch Profile"
          icon={
            <SectionIcon>
              <Building2 className="h-4 w-4" />
            </SectionIcon>
          }
        />
        <Badge variant={branch?.isActive ? "success" : "outline"} size="xs">
          {branch?.isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-4">
        <InfoTile tone="secondary">
          <FieldLabel size="compact">Branch ID</FieldLabel>
          <Text
            as="p"
            variant="body"
            className="mt-1 truncate text-sm font-semibold text-foreground"
          >
            {branch?.id || "N/A"}
          </Text>
        </InfoTile>

        <InfoTile tone="secondary">
          <FieldLabel size="compact">Branch Code</FieldLabel>
          <Text
            as="p"
            variant="body"
            className="mt-1 text-sm font-semibold uppercase text-foreground"
          >
            {branch?.code || "N/A"}
          </Text>
        </InfoTile>

        <InfoTile padding="md" tone="secondary" className="space-y-2">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span>{branch?.address || "No address provided yet."}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{branch?.phone || "No phone provided yet."}</span>
          </div>
        </InfoTile>

        <div className="grid grid-cols-1 gap-3 border-t border-border  sm:grid-cols-2">
          <InfoTile padding="md" tone="secondary">
            <FieldLabel>Created</FieldLabel>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {branch?.createdAt ? formatDate(branch.createdAt) : "N/A"}
              </span>
            </div>
          </InfoTile>
          <InfoTile padding="md" tone="secondary">
            <FieldLabel>Last Updated</FieldLabel>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
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
