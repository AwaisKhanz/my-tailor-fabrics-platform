import {
  BadgePercent,
  Banknote,
  CalendarDays,
  Layers3,
  Shirt,
} from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { formatDate, formatPKR } from "@/lib/utils";

interface GarmentOverviewCardProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentOverviewCard({ garment }: GarmentOverviewCardProps) {
  const measurementFormsCount = garment.measurementCategories?.length ?? 0;
  const workflowStepsCount = garment.workflowSteps?.length ?? 0;

  return (
    <Card>
      <CardHeader className="pb-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Shirt className="h-4 w-4 text-muted-foreground" />
          <div className="space-y-1">
            <CardTitle className="text-base">Garment Profile</CardTitle>
            <CardDescription>Core garment identity and margin snapshot</CardDescription>
          </div>
        </div>
        <Badge variant={garment.isActive ? "default" : "outline"}>
          {garment.isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-muted/40 px-3 py-3">
            <p className="text-xs text-muted-foreground">Sort Order</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {garment.sortOrder}
            </p>
          </div>
          <div className="rounded-md bg-muted/40 px-3 py-3">
            <p className="text-xs text-muted-foreground">Linked Forms / Steps</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {measurementFormsCount} form
              {measurementFormsCount === 1 ? "" : "s"} / {workflowStepsCount}{" "}
              step
              {workflowStepsCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl bg-muted/40 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                {garment.description ||
                  "No description provided for this garment type."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Created {formatDate(garment.createdAt)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1">
                <Layers3 className="h-3.5 w-3.5" />
                <span>Updated {formatDate(garment.updatedAt)}</span>
              </span>
            </div>
          </div>

          <div className="space-y-4 rounded-xl bg-muted/40 p-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs text-primary/90">Margin Snapshot</p>
              <BadgePercent className="h-4 w-4 text-primary" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Owner Margin</p>
                <p className="text-lg font-semibold text-primary">
                  {formatPKR(garment.marginAmount)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Margin Rate</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-lg font-semibold text-primary">
                    {garment.marginPercentage}%
                  </p>
                  <Banknote className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
