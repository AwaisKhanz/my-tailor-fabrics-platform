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
  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-primary/[0.02] shadow-sm">
        <CardHeader variant="section" density="compact">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            <CardTitle variant="dashboard" className="text-primary">
              Global Pricing
            </CardTitle>
          </div>
          <Label variant="dashboard">Base Shop Rates</Label>
        </CardHeader>

        <CardContent spacing="section" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Customer Price</span>
              <Typography as="span" variant="sectionTitle" className="text-lg">
                {formatPKR(garment.customerPrice ?? 0)}
              </Typography>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Employee Rate</span>
              <Typography as="span" variant="sectionTitle" className="text-lg">
                {formatPKR(garment.employeeRate ?? 0)}
              </Typography>
            </div>

            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between">
                <Label variant="dashboard">Revenue Share</Label>
                <Typography as="span" variant="muted" className="text-[10px] font-bold text-primary">
                  {formatPKR(garment.marginAmount)}
                </Typography>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${garment.marginPercentage}%` }}
                />
              </div>

              <div className="mt-1 flex justify-between">
                <Typography as="span" variant="muted" className="text-[9px] font-bold">
                  Owner Profit
                </Typography>
                <Typography as="span" variant="muted" className="text-[9px] font-bold">
                  Tailor Share
                </Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader variant="section" density="compact">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            <CardTitle variant="dashboard" className="text-primary">
              Top Tailors
            </CardTitle>
          </div>
          <Label variant="dashboard" className="mt-1">
            Efficiency Champions
          </Label>
        </CardHeader>

        <CardContent spacing="section" className="space-y-3">
          {garment.analytics.topTailors.length > 0 ? (
            garment.analytics.topTailors.map((tailor, index) => (
              <div key={`${tailor.name}-${index}`} className="flex items-center justify-between">
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

                <Badge variant="outline" className="border-border text-[10px] font-bold">
                  {tailor.count} Orders
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
