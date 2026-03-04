import Link from "next/link";
import { CalendarDays, ClipboardList, Settings, SlidersHorizontal } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

interface GarmentDetailHeaderProps {
  garment: GarmentTypeWithAnalytics;
  onOpenRates: () => void;
  canManageRates?: boolean;
}

export function GarmentDetailHeader({
  garment,
  onOpenRates,
  canManageRates = true,
}: GarmentDetailHeaderProps) {
  const garmentCode = `GT-${garment.id.slice(-4).toUpperCase()}`;
  const measurementFormsCount = garment.measurementCategories?.length ?? 0;
  const workflowStepsCount = garment.workflowSteps?.length ?? 0;

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardContent spacing="section" className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 lg:max-w-[70%]">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Garment Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {garment.name}
              </h1>
              <Badge variant={garment.isActive ? "success" : "outline"} size="xs">
                {garment.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" size="xs" className="font-semibold">
                {garmentCode}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <ClipboardList className="h-3.5 w-3.5" />
                <span>
                  {measurementFormsCount} measurement form{measurementFormsCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>
                  {workflowStepsCount} workflow step{workflowStepsCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Updated {formatDate(garment.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end lg:max-w-[520px]">
            {canManageRates ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center sm:w-auto sm:min-w-[180px]"
                onClick={onOpenRates}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Update Rates
              </Button>
            ) : null}
            <Button
              asChild
              variant="premium"
              size="lg"
              className="w-full justify-center sm:w-auto sm:min-w-[180px]"
            >
              <Link href="/settings/garments">
                <Settings className="h-4 w-4" />
                Manage Garments
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
