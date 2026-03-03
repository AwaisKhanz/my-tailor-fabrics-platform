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
  const maxValue = Math.max(...productivity.map((item) => item.value), 1);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader variant="rowSection" className="items-start">
        <CardTitle variant="dashboard">Employee Productivity</CardTitle>
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold text-primary">84%</span>
          <Label variant="dashboard">Avg This Month</Label>
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
          <div className="py-8 text-center text-xs text-muted-foreground">
            No productivity data for this period
          </div>
        ) : (
          productivity.map((employee) => {
            const percentage = Math.round((employee.value / maxValue) * 100);
            const barClass =
              percentage >= 90
                ? "bg-primary"
                : percentage >= 75
                  ? "bg-info"
                  : "bg-warning";

            return (
              <div key={employee.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">{employee.label}</span>
                  <Label variant="dashboard">{employee.value} Items</Label>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
