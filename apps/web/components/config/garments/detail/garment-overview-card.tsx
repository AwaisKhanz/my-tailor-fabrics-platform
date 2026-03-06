import {
  BadgePercent,
  Banknote,
  CalendarDays,
  Layers3,
  Shirt,
} from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { MetaPill } from "@/components/ui/meta-pill";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { Heading, Text } from "@/components/ui/typography";
import { formatDate, formatPKR } from "@/lib/utils";

interface GarmentOverviewCardProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentOverviewCard({ garment }: GarmentOverviewCardProps) {
  const measurementFormsCount = garment.measurementCategories?.length ?? 0;
  const workflowStepsCount = garment.workflowSteps?.length ?? 0;

  return (
    <Card>
      <CardHeader align="startResponsive" className="flex-row items-center !rounded-b-none justify-between gap-3 border-b border-border bg-muted/40 px-6 py-4">
        <SectionHeader
          title="Garment Profile"
          icon={
            <SectionIcon tone="default">
              <Shirt className="h-4 w-4" />
            </SectionIcon>
          }
        />
        <Badge variant={garment.isActive ? "success" : "outline"} size="xs">
          {garment.isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoTile>
            <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Sort Order</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {garment.sortOrder}
            </p>
          </InfoTile>
          <InfoTile>
            <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Linked Forms / Steps</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {measurementFormsCount} form
              {measurementFormsCount === 1 ? "" : "s"} / {workflowStepsCount}{" "}
              step
              {workflowStepsCount === 1 ? "" : "s"}
            </p>
          </InfoTile>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <InfoTile padding="contentLg" radius="xl" className="space-y-4">
            <div>
              <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Description</Label>
              <Text
                as="p"
                 variant="body"
                className="mt-1 leading-relaxed"
              >
                {garment.description ||
                  "No description provided for this garment type."}
              </Text>
            </div>

            <div className="">
              <MetaPill tone={"strong"}>
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Created {formatDate(garment.createdAt)}</span>
              </MetaPill>
              <MetaPill tone={"strong"}>
                <Layers3 className="h-3.5 w-3.5" />
                <span>Updated {formatDate(garment.updatedAt)}</span>
              </MetaPill>
            </div>
          </InfoTile>

          <InfoTile
            tone="secondary"
            padding="contentLg"
            radius="xl"
            className="space-y-4"
          >
            <div className="mb-1 flex items-center justify-between">
              <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground text-primary/90">
                Margin Snapshot
              </Label>
              <BadgePercent className="h-4 w-4 text-primary" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Owner Margin</Label>
                <Heading
                  as="div"
                  variant="section"
                  className="text-lg text-primary"
                >
                  {formatPKR(garment.marginAmount)}
                </Heading>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Margin Rate</Label>
                <div className="flex items-center gap-1.5">
                  <Heading
                    as="div"
                    variant="section"
                    className="text-lg text-primary"
                  >
                    {garment.marginPercentage}%
                  </Heading>
                  <Banknote className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
            </div>
          </InfoTile>
        </div>
      </CardContent>
    </Card>
  );
}
