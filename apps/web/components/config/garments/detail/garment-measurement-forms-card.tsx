import Link from "next/link";
import { ChevronRight, ClipboardList, Scale, Settings } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InfoTile, infoTileVariants } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface GarmentMeasurementFormsCardProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentMeasurementFormsCard({
  garment,
}: GarmentMeasurementFormsCardProps) {
  const categories = garment.measurementCategories ?? [];

  return (
    <Card>
      <CardHeader layout="rowBetweenStart" surface="mutedSection" trimBottom>
        <SectionHeader
          title="Connected Measurement Forms"
          description="These forms are shown when an order item is created for this garment."
          descriptionVariant="compact"
          icon={
            <SectionIcon tone="default">
              <ClipboardList className="h-4 w-4" />
            </SectionIcon>
          }
        />

        <div className="">
          {/* <Badge variant="default" size="xs" className="font-bold">
            {categories.length} Form{categories.length === 1 ? "" : "s"}
          </Badge> */}
          <Button asChild variant="outline" size="sm" className="h-8">
            <Link href="/settings/measurements">
              <Settings className="h-3.5 w-3.5" />
              Manage Forms
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent spacing="section" padding="inset">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/settings/measurements/${category.id}`}
                className={cn(
                  infoTileVariants({
                    padding: "content",
                    layout: "betweenGap",
                  }),
                  "group transition-all hover:border-primary/30 hover:bg-primary/5",
                )}
              >
                <div className="flex items-center gap-3">
                  <SectionIcon
                    tone="default"
                    framed={false}
                    className="rounded-md transition-colors group-hover:bg-primary"
                  >
                    <Scale className="h-4 w-4 text-primary" />
                  </SectionIcon>
                  <div>
                    <Text
                      as="p"
                      variant="body"
                      className="font-bold transition-colors group-hover:text-primary"
                    >
                      {category.name}
                    </Text>
                    <Label className="text-sm font-bold uppercase  text-muted-foreground">
                      {category.fields?.length ?? 0} measurement fields
                    </Label>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
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
            <Text as="p" variant="lead">
              No measurement forms attached.
            </Text>
            <Label className="text-sm font-bold uppercase  text-muted-foreground mt-1 block">
              Attach forms from garment management settings.
            </Label>
          </InfoTile>
        )}
      </CardContent>
    </Card>
  );
}
