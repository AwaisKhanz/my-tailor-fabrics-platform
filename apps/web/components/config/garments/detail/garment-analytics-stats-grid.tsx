import { Activity, Banknote, ClipboardList, Target } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface GarmentAnalyticsStatsGridProps {
  garment: GarmentTypeWithAnalytics;
}

export function GarmentAnalyticsStatsGrid({ garment }: GarmentAnalyticsStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/50 bg-primary/[0.01] shadow-sm transition-all hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Label variant="dashboard">Total Orders</Label>
            <Typography as="p" variant="sectionTitle" className="text-xl">
              {garment.analytics.totalOrders.toLocaleString()}
            </Typography>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-warning/[0.01] shadow-sm transition-all hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-warning/20 bg-warning/10">
            <Activity className="h-5 w-5 text-warning" />
          </div>
          <div>
            <Label variant="dashboard">Active Items</Label>
            <Typography as="p" variant="sectionTitle" className="text-xl">
              {garment.analytics.activeOrders.toLocaleString()}
            </Typography>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-success/[0.01] shadow-sm transition-all hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-success/20 bg-success/10">
            <Banknote className="h-5 w-5 text-success" />
          </div>
          <div>
            <Label variant="dashboard">Total Revenue</Label>
            <Typography as="p" variant="sectionTitle" className="text-xl">
              {formatPKR(garment.analytics.totalRevenue)}
            </Typography>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-ready/[0.01] shadow-sm transition-all hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-ready/20 bg-ready/10">
            <Target className="h-5 w-5 text-ready" />
          </div>
          <div>
            <Label variant="dashboard">Avg Actual Price</Label>
            <Typography as="p" variant="sectionTitle" className="text-xl">
              {formatPKR(garment.analytics.avgActualPrice)}
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
