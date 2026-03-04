import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { ProgressBar } from "@/components/ui/progress-track";
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
    <Card variant="panel" className="h-full">
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
          <InfoTile borderStyle="dashed" padding="none" className="py-10 text-center text-xs text-text-secondary">
            No productivity data for this period
          </InfoTile>
        ) : (
          <>
            {activeEmployee ? (
              <InfoTile padding="md">
                <p className="text-xs font-semibold text-text-primary">{activeEmployee.label}</p>
                <p className="mt-1 text-[11px] text-text-secondary">{activeEmployee.value} completed</p>
              </InfoTile>
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
                  className={`flex flex-col gap-2 rounded-md px-1 py-1 transition-colors ${activeEmployee?.label === employee.label ? "bg-interaction-hover" : ""}`}
                  onMouseEnter={() => setHoveredEmployee(employee.label)}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">{employee.label}</span>
                    <Label variant="dashboard">{employee.value} Items</Label>
                  </div>
                  <ProgressBar
                    value={percentage}
                    max={100}
                    tone="primary"
                    fillClassName={barClass}
                    size="sm"
                  />
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}
