import { Banknote } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { ProgressBar } from "@tbms/ui/components/progress-track";
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
        <CardHeader className="pb-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <CardTitle className="text-base">Global Pricing</CardTitle>
              <CardDescription>Shared pricing model</CardDescription>
            </div>
          </div>
          <Badge variant="secondary">Shared</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Customer Price
              </span>
              <span className="text-lg font-semibold">
                {formatPKR(customerPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Workflow Labour Baseline
              </span>
              <span className="text-lg font-semibold">
                {formatPKR(baselineLabourRate)}
              </span>
            </div>

            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Revenue Share</span>
                <span className="text-xs font-bold text-primary">
                  {formatPKR(marginAmount)}
                </span>
              </div>

              <ProgressBar
                value={marginPercentage}
                max={100}
                tone="primary"
                className="bg-muted"
                size="sm"
              />

              <div className="mt-1 flex justify-between">
                <span className="text-xs font-bold text-muted-foreground">
                  Owner {marginPercentage}%
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  Tailor {tailorSharePercentage}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <CardTitle className="text-base">Top Tailors</CardTitle>
              <CardDescription>Productivity ranking</CardDescription>
            </div>
          </div>
          <Badge variant="default">Productivity</Badge>
        </CardHeader>

        <CardContent className="space-y-3">
          {garment.analytics.topTailors.length > 0 ? (
            garment.analytics.topTailors.map((tailor, index) => (
              <div
                key={`${tailor.name}-${index}`}
                className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
              >
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
                  <p className="text-sm font-semibold">{tailor.name}</p>
                </div>

                <Badge
                  variant="outline"
                  className="border-border text-xs font-bold"
                >
                  {tailor.count} completed
                </Badge>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No production data yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
