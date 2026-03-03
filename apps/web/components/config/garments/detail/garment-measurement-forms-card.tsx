import Link from "next/link";
import { ChevronRight, ClipboardList, Scale } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface GarmentMeasurementFormsCardProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentMeasurementFormsCard({
  garment,
}: GarmentMeasurementFormsCardProps) {
  const categories = garment.measurementCategories ?? [];

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader variant="section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <CardTitle variant="dashboard" className="text-primary">
              Connected Measurement Forms
            </CardTitle>
          </div>
          <Badge variant="secondary" className="font-bold">
            {categories.length} Forms
          </Badge>
        </div>
        <CardDescription className="text-xs">
          These forms will be presented when creating an order for this garment.
        </CardDescription>
      </CardHeader>

      <CardContent spacing="section">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/settings/measurements/${category.id}`}
                className="group flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Scale className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Typography as="p" variant="body" className="font-bold transition-colors group-hover:text-primary">
                      {category.name}
                    </Typography>
                    <Label variant="dashboard">
                      {category.fields?.length ?? 0} measurement fields
                    </Label>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/20 py-8 text-center">
            <Typography as="p" variant="lead">
              No measurement forms attached.
            </Typography>
            <Label variant="dashboard" className="mt-1 block text-muted-foreground">
              Attach forms from garment management settings.
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
