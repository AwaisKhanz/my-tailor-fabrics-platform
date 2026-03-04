import Link from "next/link";
import { ChevronRight, ClipboardList, Scale, Settings } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile, infoTileVariants } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface GarmentMeasurementFormsCardProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentMeasurementFormsCard({
  garment,
}: GarmentMeasurementFormsCardProps) {
  const categories = garment.measurementCategories ?? [];

  return (
    <Card variant="shell">
      <CardHeader variant="rowSection" className="items-start gap-3 sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SectionIcon tone="primary">
              <ClipboardList className="h-4 w-4" />
            </SectionIcon>
            <CardTitle className="text-base font-semibold tracking-tight">
              Connected Measurement Forms
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            These forms are shown when an order item is created for this garment.
          </CardDescription>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <Badge variant="secondary" size="xs" className="font-bold">
            {categories.length} Form{categories.length === 1 ? "" : "s"}
          </Badge>
          <Button asChild variant="outline" size="sm" className="h-8">
            <Link href="/settings/measurements">
              <Settings className="h-3.5 w-3.5" />
              Manage Forms
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent spacing="section" className="p-5 sm:p-6">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/settings/measurements/${category.id}`}
                className={cn(
                  infoTileVariants({ padding: "content", layout: "betweenGap" }),
                  "group transition-all hover:border-primary/30 hover:bg-primary/5",
                )}
              >
                <div className="flex items-center gap-3">
                  <SectionIcon
                    tone="primary"
                    framed={false}
                    className="rounded-md transition-colors group-hover:bg-primary/20"
                  >
                    <Scale className="h-4 w-4 text-primary" />
                  </SectionIcon>
                  <div>
                    <Typography as="p" variant="body" className="font-bold transition-colors group-hover:text-primary">
                      {category.name}
                    </Typography>
                    <Label variant="dashboard">
                      {category.fields?.length ?? 0} measurement fields
                    </Label>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-text-secondary transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        ) : (
          <InfoTile
            borderStyle="dashed"
            padding="none"
            radius="xl"
            className="col-span-full py-8 text-center"
          >
            <Typography as="p" variant="lead">
              No measurement forms attached.
            </Typography>
            <Label variant="dashboard" className="mt-1 block text-text-secondary">
              Attach forms from garment management settings.
            </Label>
          </InfoTile>
        )}
      </CardContent>
    </Card>
  );
}
