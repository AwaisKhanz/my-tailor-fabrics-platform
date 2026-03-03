import { BadgePercent, Banknote, CalendarDays, Layers3, Shirt } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { formatDate, formatPKR } from "@/lib/utils";

interface GarmentOverviewCardProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentOverviewCard({ garment }: GarmentOverviewCardProps) {
  const measurementFormsCount = garment.measurementCategories?.length ?? 0;
  const workflowStepsCount = garment.workflowSteps?.length ?? 0;

  return (
    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
      <CardHeader variant="rowSection" className="items-start sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Shirt className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold tracking-tight">
            Garment Profile
          </CardTitle>
        </div>
        <Badge variant={garment.isActive ? "success" : "outline"} size="xs">
          {garment.isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <CardContent spacing="section" className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Sort Order
            </Label>
            <p className="mt-1 text-sm font-semibold text-foreground">{garment.sortOrder}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Linked Forms / Steps
            </Label>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {measurementFormsCount} form{measurementFormsCount === 1 ? "" : "s"} / {workflowStepsCount} step
              {workflowStepsCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-border/70 bg-background/40 p-4">
            <div>
              <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Description
              </Label>
              <Typography as="p" variant="body" className="mt-1 leading-relaxed">
                {garment.description || "No description provided for this garment type."}
              </Typography>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs text-muted-foreground sm:grid-cols-2">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Created {formatDate(garment.createdAt)}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <Layers3 className="h-3.5 w-3.5" />
                <span>Updated {formatDate(garment.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-1 flex items-center justify-between">
              <Label className="text-[10px] uppercase tracking-[0.08em] text-primary/90">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
