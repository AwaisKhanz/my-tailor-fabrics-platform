import { BadgePercent, Banknote, Shirt } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface GarmentOverviewCardProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentOverviewCard({ garment }: GarmentOverviewCardProps) {
  return (
    <Card className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center gap-2">
          <Shirt className="h-4 w-4 text-primary" />
          <CardTitle variant="dashboard" className="text-primary">
            Overview
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label variant="dashboard">Description</Label>
              <Typography as="p" variant="body" className="mt-1 leading-relaxed">
                {garment.description || "No description provided for this garment type."}
              </Typography>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <Label variant="dashboard">Sort Order</Label>
                <Typography as="p" variant="body" className="mt-1 font-bold">
                  {garment.sortOrder}
                </Typography>
              </div>
              <div>
                <Label variant="dashboard">Created</Label>
                <Typography as="p" variant="body" className="mt-1 font-bold">
                  {new Date(garment.createdAt).toLocaleDateString()}
                </Typography>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
              <div className="mb-4 flex items-center justify-between">
                <Label variant="dashboard" className="text-primary opacity-100">
                  Pricing Analysis
                </Label>
                <BadgePercent className="h-4 w-4 text-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label variant="dashboard">Margin</Label>
                  <Typography as="p" variant="sectionTitle" className="text-lg">
                    {formatPKR(garment.marginAmount)}
                  </Typography>
                </div>

                <div className="space-y-1">
                  <Label variant="dashboard">Profitability</Label>
                  <div className="flex items-center gap-1.5">
                    <Typography as="p" variant="sectionTitle" className="text-lg text-success">
                      {garment.marginPercentage}%
                    </Typography>
                    <Banknote className="h-3.5 w-3.5 text-success" />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <Badge variant="outline" size="xs" className="font-bold">
                  Owner margin vs tailor payout
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
