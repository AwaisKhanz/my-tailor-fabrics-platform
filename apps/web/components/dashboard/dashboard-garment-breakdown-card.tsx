import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { GarmentRevenue } from "@/lib/api/reports";

interface DashboardGarmentBreakdownCardProps {
  garments: GarmentRevenue[];
  totalItems: number;
}

const CIRCLE_TEXT_COLORS = ["text-primary", "text-chart-2", "text-chart-3"] as const;
const DOT_BG_COLORS = ["bg-primary", "bg-chart-2", "bg-chart-3"] as const;

export function DashboardGarmentBreakdownCard({
  garments,
  totalItems,
}: DashboardGarmentBreakdownCardProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader variant="section" density="compact">
        <CardTitle variant="dashboard">Orders by Garment Type</CardTitle>
      </CardHeader>
      <CardContent spacing="section" className="flex flex-col items-center justify-center">
        <div className="relative mb-6 mt-4 h-48 w-48">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="stroke-current text-muted"
              strokeWidth="12"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            />
            {garments.slice(0, 3).map((garment, index) => {
              const percentage = totalItems > 0 ? (garment.value / totalItems) * 100 : 0;
              const strokeDash = (percentage * 251.3) / 100;

              let offset = 0;
              for (let i = 0; i < index; i += 1) {
                const prevPercentage = totalItems > 0 ? (garments[i].value / totalItems) * 100 : 0;
                offset += (prevPercentage * 251.3) / 100;
              }

              return (
                <circle
                  key={garment.label}
                  className={`${CIRCLE_TEXT_COLORS[index % CIRCLE_TEXT_COLORS.length]} stroke-current`}
                  strokeWidth="12"
                  strokeLinecap="butt"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray={`${strokeDash} 251.3`}
                  strokeDashoffset={-offset}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{totalItems}</span>
            <Label variant="dashboard">Total Items</Label>
          </div>
        </div>

        <div className="w-full space-y-3">
          {garments.slice(0, 3).map((garment, index) => {
            const percentage = totalItems > 0 ? Math.round((garment.value / totalItems) * 100) : 0;
            return (
              <div key={garment.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${DOT_BG_COLORS[index % DOT_BG_COLORS.length]}`}
                  />
                  <span className="font-medium text-muted-foreground">{garment.label}</span>
                </div>
                <span className="font-bold">{percentage}%</span>
              </div>
            );
          })}

          {garments.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground">No data</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
