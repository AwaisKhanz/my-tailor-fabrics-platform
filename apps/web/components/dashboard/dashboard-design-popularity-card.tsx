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
  const [hoveredDesignName, setHoveredDesignName] = useState<string | null>(
    designs[0]?.name ?? null,
  );
  const maxCount = Math.max(...designs.map((design) => design.count), 1);
  const activeDesign =
    designs.find((design) => design.name === hoveredDesignName) ?? designs[0];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader density="compact" className="border-b !rounded-b-none border-border bg-muted/40 px-6 py-4">
        <CardTitle className="text-base font-bold normal-case tracking-tight">Design Popularity</CardTitle>
        <p className="text-xs text-muted-foreground">
          Most requested designs in the selected period.
        </p>
      </CardHeader>
      <CardContent
        spacing="section"
        className="flex flex-1 flex-col space-y-3 pt-4"
      >
        <div className="flex flex-1 flex-col space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))
          ) : designs.length === 0 ? (
            <InfoTile
              borderStyle="dashed"
              padding="none"
              className="flex flex-1 items-center justify-center px-4 py-8 text-center text-xs text-muted-foreground"
            >
              No design data found for the selected period.
            </InfoTile>
          ) : (
            <>
              {activeDesign ? (
                <InfoTile tone="secondary" padding="md">
                  <p className="text-xs font-semibold text-foreground">
                    {activeDesign.name}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {activeDesign.count} requests
                  </p>
                </InfoTile>
              ) : null}

              {designs.map((design) => (
                <div
                  key={design.name}
                  className={`space-y-1.5 rounded-lg border px-2.5 py-2 transition-colors ${
                    activeDesign?.name === design.name
                      ? "border-primary/35 bg-accent"
                      : "border-border bg-card/60 hover:border-border"
                  }`}
                  onMouseEnter={() => setHoveredDesignName(design.name)}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <Label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">{design.name}</Label>
                    <span className="font-medium text-muted-foreground">
                      {design.count}
                    </span>
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
          variant="outline"
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
