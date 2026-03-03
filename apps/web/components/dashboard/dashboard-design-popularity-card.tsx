import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { DesignAnalytics } from "@/lib/api/reports";

interface DashboardDesignPopularityCardProps {
  loading: boolean;
  designs: DesignAnalytics[];
  onViewAnalytics: () => void;
}

export function DashboardDesignPopularityCard({
  loading,
  designs,
  onViewAnalytics,
}: DashboardDesignPopularityCardProps) {
  const maxCount = Math.max(...designs.map((design) => design.count), 1);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader variant="section" density="compact">
        <CardTitle variant="dashboard">Design Popularity</CardTitle>
      </CardHeader>
      <CardContent spacing="section" className="space-y-4 pt-4">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))
          ) : designs.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
              No design data found
            </div>
          ) : (
            designs.map((design) => (
              <div key={design.name} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <Label variant="dashboard">{design.name}</Label>
                  <span className="font-medium text-muted-foreground">{design.count}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(design.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <Button
          variant="dashboard"
          size="sm"
          className="mt-6 h-8 w-full"
          onClick={onViewAnalytics}
        >
          View Full Analytics
        </Button>
      </CardContent>
    </Card>
  );
}
