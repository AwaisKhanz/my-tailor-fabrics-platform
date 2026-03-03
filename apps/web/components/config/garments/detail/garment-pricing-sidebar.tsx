import { Banknote } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
        <CardHeader variant="rowSection" className="items-start sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Banknote className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight">
              Global Pricing
            </CardTitle>
          </div>
          <Badge variant="info" size="xs">
            Shared
          </Badge>
        </CardHeader>

        <CardContent spacing="section" className="space-y-4 p-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Customer Price</span>
              <Typography as="span" variant="sectionTitle" className="text-lg">
                {formatPKR(customerPrice)}
              </Typography>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Employee Rate</span>
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

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${marginPercentage}%` }}
                />
              </div>

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

      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
        <CardHeader variant="rowSection" className="items-start sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info ring-1 ring-info/20">
              <Banknote className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight">
              Top Tailors
            </CardTitle>
          </div>
          <Badge variant="secondary" size="xs">
            Productivity
          </Badge>
        </CardHeader>

        <CardContent spacing="section" className="space-y-3 p-5 sm:p-6">
          {garment.analytics.topTailors.length > 0 ? (
            garment.analytics.topTailors.map((tailor, index) => (
              <div
                key={`${tailor.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/15 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold",
                      index === 0
                        ? "bg-ready/20 text-ready"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </div>
                  <Typography as="p" variant="body" className="font-bold">
                    {tailor.name}
                  </Typography>
                </div>

                <Badge variant="outline" size="xs" className="border-border text-[10px] font-bold">
                  {tailor.count} completed
                </Badge>
              </div>
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
