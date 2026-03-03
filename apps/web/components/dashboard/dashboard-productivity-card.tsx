import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmployeeProductivity } from "@/lib/api/reports";

interface DashboardProductivityCardProps {
  loading: boolean;
  productivity: EmployeeProductivity[];
}

export function DashboardProductivityCard({
  loading,
  productivity,
}: DashboardProductivityCardProps) {
  const [hoveredEmployee, setHoveredEmployee] = useState<string | null>(productivity[0]?.label ?? null);
  const maxValue = Math.max(...productivity.map((item) => item.value), 1);
  const activeEmployee = productivity.find((item) => item.label === hoveredEmployee) ?? productivity[0];
  const average = productivity.length
    ? Math.round(productivity.reduce((sum, item) => sum + item.value, 0) / productivity.length)
    : 0;

  return (
    <Card className="border-border/70 bg-card h-full">
      <CardHeader variant="rowSection" className="items-start">
        <CardTitle variant="dashboard" className="text-base normal-case tracking-tight">
          Employee Productivity
        </CardTitle>
        <div className="flex flex-col items-end">
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <span className="text-xl font-bold text-primary">{average}</span>
          )}
          <Label variant="dashboard">Avg Items / Tailor</Label>
        </div>
      </CardHeader>
      <CardContent spacing="section" className="space-y-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))
        ) : productivity.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background/20 py-10 text-center text-xs text-muted-foreground">
            No productivity data for this period
          </div>
        ) : (
          <>
            {activeEmployee ? (
              <div className="rounded-lg border border-border/60 bg-background/35 px-3 py-2">
                <p className="text-xs font-semibold text-foreground">{activeEmployee.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{activeEmployee.value} completed</p>
              </div>
            ) : null}

            {productivity.map((employee) => {
              const percentage = Math.round((employee.value / maxValue) * 100);
              const barClass =
                percentage >= 90
                  ? "bg-primary"
                  : percentage >= 75
                    ? "bg-info"
                    : "bg-warning";

              return (
                <div
                  key={employee.label}
                  className={`flex flex-col gap-2 rounded-md px-1 py-1 transition-colors ${activeEmployee?.label === employee.label ? "bg-primary/5" : ""}`}
                  onMouseEnter={() => setHoveredEmployee(employee.label)}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">{employee.label}</span>
                    <Label variant="dashboard">{employee.value} Items</Label>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}
