import { Sparkles } from "lucide-react";
import { type DesignAnalytics } from "@tbms/shared-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface ReportsDesignPopularityCardProps {
  designs: DesignAnalytics[];
}

export function ReportsDesignPopularityCard({
  designs,
}: ReportsDesignPopularityCardProps) {
  const maxCount = Math.max(...designs.map((design) => design.count), 1);

  return (
    <Card variant="premium" className="overflow-hidden">
      <CardHeader variant="section" density="compact">
        <CardTitle variant="dashboard" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Design Popularity
        </CardTitle>
        <CardDescription>Breakdown of most requested design types</CardDescription>
      </CardHeader>

      <CardContent spacing="section" className="space-y-4">
        {designs.length === 0 ? (
          <Typography as="p" variant="lead" className="py-8 text-center">
            No design data available for this period.
          </Typography>
        ) : (
          designs.map((design) => (
            <div key={design.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label variant="dashboard" className="opacity-100">
                  {design.name}
                </Label>
                <Label variant="dashboard">{design.count} items</Label>
              </div>

              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-1000"
                  style={{ width: `${(design.count / maxCount) * 100}%` }}
                />
              </div>

              <div className="flex justify-between">
                <Label variant="dashboard" className="lowercase">
                  revenue: {formatPKR(design.revenue)}
                </Label>
                <Label variant="dashboard" className="lowercase text-ready">
                  payout: {formatPKR(design.payout)}
                </Label>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
