import { BadgePercent, Banknote, CalendarDays, Layers3, Shirt } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { MetaPill } from "@/components/ui/meta-pill";
import { SectionIcon } from "@/components/ui/section-icon";
import { Typography } from "@/components/ui/typography";
import { formatDate, formatPKR } from "@/lib/utils";

interface GarmentOverviewCardProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentOverviewCard({ garment }: GarmentOverviewCardProps) {
  const measurementFormsCount = garment.measurementCategories?.length ?? 0;
  const workflowStepsCount = garment.workflowSteps?.length ?? 0;

  return (
    <Card variant="premium">
      <CardHeader variant="rowSection" align="startResponsive">
        <div className="flex items-center gap-2">
          <SectionIcon tone="primary">
            <Shirt className="h-4 w-4" />
          </SectionIcon>
          <CardTitle variant="section">
            Garment Profile
          </CardTitle>
        </div>
        <Badge variant={garment.isActive ? "success" : "outline"} size="xs">
          {garment.isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoTile>
            <Label variant="micro">
              Sort Order
            </Label>
            <p className="mt-1 text-sm font-semibold text-text-primary">{garment.sortOrder}</p>
          </InfoTile>
          <InfoTile>
            <Label variant="micro">
              Linked Forms / Steps
            </Label>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              {measurementFormsCount} form{measurementFormsCount === 1 ? "" : "s"} / {workflowStepsCount} step
              {workflowStepsCount === 1 ? "" : "s"}
            </p>
          </InfoTile>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <InfoTile padding="contentLg" radius="xl" className="space-y-4">
            <div>
              <Label variant="micro">
                Description
              </Label>
              <Typography as="p" variant="body" className="mt-1 leading-relaxed">
                {garment.description || "No description provided for this garment type."}
              </Typography>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs text-text-secondary sm:grid-cols-2">
              <MetaPill>
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Created {formatDate(garment.createdAt)}</span>
              </MetaPill>
              <MetaPill>
                <Layers3 className="h-3.5 w-3.5" />
                <span>Updated {formatDate(garment.updatedAt)}</span>
              </MetaPill>
            </div>
          </InfoTile>

          <InfoTile tone="primarySoft" padding="contentLg" radius="xl" className="space-y-4">
            <div className="mb-1 flex items-center justify-between">
              <Label variant="micro" className="text-primary/90">
                Margin Snapshot
              </Label>
              <BadgePercent className="h-4 w-4 text-primary" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label variant="dashboard">Owner Margin</Label>
                <Typography as="p" variant="sectionTitle" className="text-lg text-primary">
                  {formatPKR(garment.marginAmount)}
                </Typography>
              </div>

              <div className="space-y-1">
                <Label variant="dashboard">Margin Rate</Label>
                <div className="flex items-center gap-1.5">
                  <Typography as="p" variant="sectionTitle" className="text-lg text-success">
                    {garment.marginPercentage}%
                  </Typography>
                  <Banknote className="h-3.5 w-3.5 text-success" />
                </div>
              </div>
            </div>

            <Badge variant="outline" size="xs" className="font-bold">
              Revenue split based on current global prices
            </Badge>
          </InfoTile>
        </div>
      </CardContent>
    </Card>
  );
}
