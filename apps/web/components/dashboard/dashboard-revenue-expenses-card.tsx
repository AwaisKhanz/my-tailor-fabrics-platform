import { BarChart, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatPKR } from "@/lib/utils";

interface RevenueExpensesRow {
  month: string;
  revenue: number;
  expenses: number;
}

interface DashboardRevenueExpensesCardProps {
  rows: RevenueExpensesRow[];
}

export function DashboardRevenueExpensesCard({
  rows,
}: DashboardRevenueExpensesCardProps) {
  return (
    <Card className="border-border shadow-sm lg:col-span-2">
      <CardHeader variant="rowSection" className="items-center">
        <CardTitle variant="dashboard">Revenue vs. Expenses</CardTitle>
        <div className="flex items-center gap-1 transition-colors hover:bg-muted/70">
          <Label variant="dashboard">Last 6 Months</Label>
          <Clock className="ml-1 h-3 w-3" />
        </div>
      </CardHeader>
      <CardContent spacing="section">
        {rows.length === 0 ? (
          <div className="relative mb-4 mt-2 flex h-[250px] w-full items-center justify-center border-b border-dashed border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/40">
              <BarChart className="h-10 w-10 opacity-20" />
              <span className="opacity-50">No revenue/expense data available</span>
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {rows.map((row) => (
              <div
                key={row.month}
                className="grid grid-cols-[60px_1fr_1fr] items-center gap-3"
              >
                <span className="text-xs text-muted-foreground">{row.month}</span>
                <div className="truncate rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  {formatPKR(row.revenue)}
                </div>
                <div className="truncate rounded-md bg-chart-2/10 px-2 py-1 text-xs font-semibold text-chart-2">
                  {formatPKR(row.expenses)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
