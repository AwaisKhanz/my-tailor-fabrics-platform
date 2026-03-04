import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { ProgressBar } from "@/components/ui/progress-track";
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
    <Card variant="premium">
      <CardHeader variant="section" density="compact">
        <CardTitle variant="dashboardSection">
          Design Popularity
        </CardTitle>
        <p className="text-xs text-text-secondary">Most requested designs in the selected period.</p>
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
            <InfoTile borderStyle="dashed" padding="none" className="px-4 py-8 text-center text-xs text-text-secondary">
              No design data found for the selected period.
            </InfoTile>
          ) : (
            <>
              {activeDesign ? (
                <InfoTile tone="elevatedSoft" padding="md">
                  <p className="text-xs font-semibold text-text-primary">{activeDesign.name}</p>
                  <p className="mt-1 text-[11px] text-text-secondary">{activeDesign.count} requests</p>
                </InfoTile>
              ) : null}

              {designs.map((design) => (
                <div
                  key={design.name}
                  className={`space-y-1.5 rounded-lg border px-2.5 py-2 transition-colors ${
                    activeDesign?.name === design.name
                      ? "border-primary/35 bg-interaction-hover"
                      : "border-divider/70 bg-surface-elevated/60 hover:border-borderStrong/70"
                  }`}
                  onMouseEnter={() => setHoveredDesignName(design.name)}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <Label variant="dashboard">{design.name}</Label>
                    <span className="font-medium text-text-secondary">{design.count}</span>
                  </div>
                  <ProgressBar
                    value={design.count}
                    max={maxCount}
                    tone="primary"
                    size="xs"
                  />
                </div>
              ))}
            </>
          )}
        </div>

        <Button
          variant="outlinePrimary"
          size="sm"
          className="mt-1 h-9 w-full"
          onClick={onViewAnalytics}
        >
          View Full Analytics
        </Button>
      </CardContent>
    </Card>
  );
}
