import { Banknote } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { InfoTile } from "@/components/ui/info-tile";
import { ProgressBar } from "@/components/ui/progress-track";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { Heading, Text } from "@/components/ui/typography";
import { cn, formatPKR } from "@/lib/utils";

interface GarmentPricingSidebarProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentPricingSidebar({ garment }: GarmentPricingSidebarProps) {
  const customerPrice = garment.customerPrice ?? 0;
  const marginAmount = garment.marginAmount ?? 0;
  const baselineLabourRate = customerPrice - marginAmount;
  const marginPercentage = Math.max(
    0,
    Math.min(garment.marginPercentage ?? 0, 100),
  );
  const tailorSharePercentage = Math.max(0, 100 - marginPercentage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          layout="rowBetweenResponsive"
          surface="mutedSection"
          trimBottom
        >
          <SectionHeader
            title="Global Pricing"
            icon={
              <SectionIcon tone="default">
                <Banknote className="h-4 w-4" />
              </SectionIcon>
            }
          />
          <Badge variant="info" size="xs">
            Shared
          </Badge>
        </CardHeader>

        <CardContent spacing="section" padding="inset" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Customer Price
              </span>
              <Heading as="span" variant="section" className="text-lg">
                {formatPKR(customerPrice)}
              </Heading>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Workflow Labour Baseline
              </span>
              <Heading as="span" variant="section" className="text-lg">
                {formatPKR(baselineLabourRate)}
              </Heading>
            </div>

            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between">
                <FieldLabel>Revenue Share</FieldLabel>
                <Text
                  as="span"
                  variant="muted"
                  className="text-xs font-bold text-primary"
                >
                  {formatPKR(marginAmount)}
                </Text>
              </div>

              <ProgressBar
                value={marginPercentage}
                max={100}
                tone="primary"
                className="bg-muted"
                size="sm"
              />

              <div className="mt-1 flex justify-between">
                <Text as="span" variant="muted" className="text-xs font-bold">
                  Owner {marginPercentage}%
                </Text>
                <Text as="span" variant="muted" className="text-xs font-bold">
                  Tailor {tailorSharePercentage}%
                </Text>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          layout="rowBetweenResponsive"
          surface="mutedSection"
          trimBottom
        >
          <SectionHeader
            title="Top Tailors"
            icon={
              <SectionIcon tone="info">
                <Banknote className="h-4 w-4" />
              </SectionIcon>
            }
          />
          <Badge variant="default" size="xs">
            Productivity
          </Badge>
        </CardHeader>

        <CardContent spacing="section" padding="inset" className="space-y-3">
          {garment.analytics.topTailors.length > 0 ? (
            garment.analytics.topTailors.map((tailor, index) => (
              <InfoTile key={`${tailor.name}-${index}`} layout="betweenGap">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold",
                      index === 0
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </div>
                  <Text as="p" variant="body" className="font-bold">
                    {tailor.name}
                  </Text>
                </div>

                <Badge
                  variant="outline"
                  size="xs"
                  className="border-border text-xs font-bold"
                >
                  {tailor.count} completed
                </Badge>
              </InfoTile>
            ))
          ) : (
            <Text as="p" variant="lead" className="py-4 text-center text-xs">
              No production data yet.
            </Text>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
