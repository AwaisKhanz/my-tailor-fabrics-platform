import Link from "next/link";
import { ChevronRight, ClipboardList, Scale, Settings } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import {
  buildMeasurementCategoryRoute,
  MEASUREMENTS_SETTINGS_ROUTE,
} from "@/lib/settings-routes";

interface GarmentMeasurementFormsCardProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentMeasurementFormsCard({
  garment,
}: GarmentMeasurementFormsCardProps) {
  const categories = garment.measurementCategories ?? [];

  return (
    <Card>
      <CardHeader className="pb-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <div className="space-y-1">
            <CardTitle className="text-base">Connected Measurement Forms</CardTitle>
            <CardDescription>
              These forms are shown when an order item is created for this garment.
            </CardDescription>
          </div>
        </div>

        <div className="">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            render={<Link href={MEASUREMENTS_SETTINGS_ROUTE} />}
          >
            <Settings className="h-3.5 w-3.5" />
            Manage Forms
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={buildMeasurementCategoryRoute(category.id)}
                className="group flex items-center justify-between rounded-md bg-muted/40 px-3 py-3 transition-all hover:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2 transition-colors group-hover:bg-primary">
                    <Scale className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold transition-colors group-hover:text-primary">
                      {category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.fields?.length ?? 0} measurement fields
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="col-span-full rounded-xl border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">No measurement forms attached.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Attach forms from garment management settings.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
