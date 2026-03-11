import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";
import { GARMENTS_SETTINGS_ROUTE } from "@/lib/settings-routes";
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
    <div className="space-y-3">
      <PageHeader
        title={garment.name}
        description="Garment command center for profile, measurement forms, workflow rates, and pricing logs."
        actions={
          <>
            {canManageRates ? (
              <Button variant="outline" onClick={onOpenRates}>
                <SlidersHorizontal className="h-4 w-4" />
                Update Rates
              </Button>
            ) : null}
            <Button
              variant="default"
              render={<Link href={GARMENTS_SETTINGS_ROUTE} />}
            >
              <Settings className="h-4 w-4" />
              Manage Garments
            </Button>
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={garment.isActive ? "default" : "outline"}>
          {garment.isActive ? "Active" : "Inactive"}
        </Badge>
        <Badge variant="outline">{garmentCode}</Badge>
        <Badge variant="outline" className="gap-1">
          <ClipboardList className="h-3.5 w-3.5" />
          {measurementFormsCount} measurement form
          {measurementFormsCount === 1 ? "" : "s"}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {workflowStepsCount} workflow step{workflowStepsCount === 1 ? "" : "s"}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          Updated {formatDate(garment.updatedAt)}
        </Badge>
      </div>
    </div>
  );
}
