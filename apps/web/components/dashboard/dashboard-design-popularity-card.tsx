import { useState } from "react";
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
  const [hoveredDesignName, setHoveredDesignName] = useState<string | null>(designs[0]?.name ?? null);
  const maxCount = Math.max(...designs.map((design) => design.count), 1);
  const activeDesign = designs.find((design) => design.name === hoveredDesignName) ?? designs[0];

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader variant="section" density="compact">
        <CardTitle variant="dashboard" className="text-base normal-case tracking-tight">
          Design Popularity
        </CardTitle>
        <p className="text-xs text-muted-foreground">Most requested designs in the selected period.</p>
      </CardHeader>
      <CardContent spacing="section" className="space-y-3 pt-4">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))
          ) : designs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-background/20 px-4 py-8 text-center text-xs text-muted-foreground">
              No design data found for the selected period.
            </div>
          ) : (
            <>
              {activeDesign ? (
                <div className="rounded-lg border border-border/60 bg-background/35 px-3 py-2">
                  <p className="text-xs font-semibold text-foreground">{activeDesign.name}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{activeDesign.count} requests</p>
                </div>
              ) : null}

              {designs.map((design) => (
                <div
                  key={design.name}
                  className={`space-y-1 rounded-md px-1 py-1 transition-colors ${activeDesign?.name === design.name ? "bg-primary/5" : ""}`}
                  onMouseEnter={() => setHoveredDesignName(design.name)}
                >
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
              ))}
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-1 h-9 w-full border-primary/30 text-primary"
          onClick={onViewAnalytics}
        >
          View Full Analytics
        </Button>
      </CardContent>
    </Card>
  );
}
