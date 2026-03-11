import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { InfoTile } from "@/components/ui/info-tile";
import { InteractiveTile } from "@/components/ui/interactive-tile";
import { ProgressBar } from "@/components/ui/progress-track";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmployeeProductivity } from "@tbms/shared-types";

interface DashboardProductivityCardProps {
  loading: boolean;
  productivity: EmployeeProductivity[];
}

export function DashboardProductivityCard({
  loading,
  productivity,
}: DashboardProductivityCardProps) {
  const [hoveredEmployee, setHoveredEmployee] = useState<string | null>(
    productivity[0]?.label ?? null,
  );
  const maxValue = Math.max(...productivity.map((item) => item.value), 1);
  const activeEmployee =
    productivity.find((item) => item.label === hoveredEmployee) ??
    productivity[0];
  const average = productivity.length
    ? Math.round(
        productivity.reduce((sum, item) => sum + item.value, 0) /
          productivity.length,
      )
    : 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader layout="rowBetweenStart" surface="mutedSection" trimBottom>
        <CardTitle className="text-base font-bold normal-case ">
          Employee Productivity
        </CardTitle>
        <div className="flex flex-col items-end">
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <span className="text-xl font-bold text-primary">{average}</span>
          )}
          <FieldLabel>Avg Items / Tailor</FieldLabel>
        </div>
      </CardHeader>
      <CardContent spacing="section" className="flex flex-1 flex-col gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))
        ) : productivity.length === 0 ? (
          <InfoTile
            borderStyle="dashed"
            padding="none"
            className="flex flex-1 items-center justify-center px-4 py-10 text-center text-xs text-muted-foreground"
          >
            No productivity data for this period
          </InfoTile>
        ) : (
          <>
            {activeEmployee ? (
              <InfoTile tone="secondary" padding="md">
                <p className="text-xs font-semibold text-foreground">
                  {activeEmployee.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeEmployee.value} completed
                </p>
              </InfoTile>
            ) : null}

            {productivity.map((employee) => {
              const percentage = Math.round((employee.value / maxValue) * 100);
              const barClass =
                percentage >= 90
                  ? "bg-primary"
                  : percentage >= 75
                    ? "bg-primary"
                    : "bg-secondary";

              return (
                <InteractiveTile
                  key={employee.label}
                  active={activeEmployee?.label === employee.label}
                  className="flex flex-col gap-2 px-2.5 py-2"
                  onMouseEnter={() => setHoveredEmployee(employee.label)}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-foreground">
                      {employee.label}
                    </span>
                    <FieldLabel>{employee.value} Items</FieldLabel>
                  </div>
                  <ProgressBar
                    value={percentage}
                    max={100}
                    tone="primary"
                    fillClassName={barClass}
                    size="sm"
                  />
                </InteractiveTile>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}
