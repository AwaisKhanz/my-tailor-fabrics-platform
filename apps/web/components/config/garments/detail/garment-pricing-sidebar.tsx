import { Banknote } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { ProgressBar } from "@/components/ui/progress-track";
import { SectionIcon } from "@/components/ui/section-icon";
import { Typography } from "@/components/ui/typography";
import { cn, formatPKR } from "@/lib/utils";

interface GarmentPricingSidebarProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentPricingSidebar({ garment }: GarmentPricingSidebarProps) {
  const customerPrice = garment.customerPrice ?? 0;
  const employeeRate = garment.employeeRate ?? 0;
  const marginAmount = garment.marginAmount ?? 0;
  const marginPercentage = Math.max(0, Math.min(garment.marginPercentage ?? 0, 100));
  const tailorSharePercentage = Math.max(0, 100 - marginPercentage);

  return (
    <div className="space-y-6">
      <Card variant="premium">
        <CardHeader variant="rowSection" align="startResponsive">
          <div className="flex items-center gap-2">
            <SectionIcon tone="primary">
              <Banknote className="h-4 w-4" />
            </SectionIcon>
            <CardTitle variant="section">
              Global Pricing
            </CardTitle>
          </div>
          <Badge variant="info" size="xs">
            Shared
          </Badge>
        </CardHeader>

        <CardContent spacing="section" padding="inset" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Customer Price</span>
              <Typography as="span" variant="sectionTitle" className="text-lg">
                {formatPKR(customerPrice)}
              </Typography>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Employee Rate</span>
              <Typography as="span" variant="sectionTitle" className="text-lg">
                {formatPKR(employeeRate)}
              </Typography>
            </div>

            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between">
                <Label variant="dashboard">Revenue Share</Label>
                <Typography as="span" variant="muted" className="text-[10px] font-bold text-primary">
                  {formatPKR(marginAmount)}
                </Typography>
              </div>

              <ProgressBar
                value={marginPercentage}
                max={100}
                tone="primary"
                className="bg-muted"
                size="sm"
              />

              <div className="mt-1 flex justify-between">
                <Typography as="span" variant="muted" className="text-[9px] font-bold">
                  Owner {marginPercentage}%
                </Typography>
                <Typography as="span" variant="muted" className="text-[9px] font-bold">
                  Tailor {tailorSharePercentage}%
                </Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="premium">
        <CardHeader variant="rowSection" align="startResponsive">
          <div className="flex items-center gap-2">
            <SectionIcon tone="info">
              <Banknote className="h-4 w-4" />
            </SectionIcon>
            <CardTitle variant="section">
              Top Tailors
            </CardTitle>
          </div>
          <Badge variant="secondary" size="xs">
            Productivity
          </Badge>
        </CardHeader>

        <CardContent spacing="section" padding="inset" className="space-y-3">
          {garment.analytics.topTailors.length > 0 ? (
            garment.analytics.topTailors.map((tailor, index) => (
              <InfoTile
                key={`${tailor.name}-${index}`}
                layout="betweenGap"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold",
                      index === 0
                        ? "bg-ready/20 text-ready"
                        : "bg-muted text-text-secondary",
                    )}
                  >
                    {index + 1}
                  </div>
                  <Typography as="p" variant="body" className="font-bold">
                    {tailor.name}
                  </Typography>
                </div>

                <Badge variant="outline" size="xs" className="border-divider text-[10px] font-bold">
                  {tailor.count} completed
                </Badge>
              </InfoTile>
            ))
          ) : (
            <Typography as="p" variant="lead" className="py-4 text-center text-xs">
              No production data yet.
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
