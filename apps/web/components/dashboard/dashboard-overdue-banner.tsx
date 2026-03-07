import { AlertTriangle, ArrowRight } from "lucide-react";
import { OrderStatus, type DashboardStats } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardOverdueBannerProps {
  loading: boolean;
  error: boolean;
  stats: DashboardStats | null;
  onViewOverdue: () => void;
}

export function DashboardOverdueBanner({
  loading,
  error,
  stats,
  onViewOverdue,
}: DashboardOverdueBannerProps) {
  if (loading) {
    return <Skeleton className="h-24 w-full rounded-xl" />;
  }

  const overdueCount = stats?.overdueCount ?? stats?.overdueOrders ?? 0;

  if (overdueCount > 0) {
    return (
      <Card className="bg-muted shadow-sm">
        <CardContent
          spacing="section"
          className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="flex items-start gap-3 sm:items-center sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <Label className="text-sm font-bold uppercase tracking-tight text-muted-foreground block text-destructive">
                {overdueCount} Overdue {overdueCount === 1 ? "Order" : "Orders"}
              </Label>
              <p className="text-sm text-destructive/80">
                These orders have passed their due date and require immediate
                attention.
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            className="w-full shrink-0 sm:w-auto"
            onClick={onViewOverdue}
          >
            View Overdue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!error) {
    return <></>;
  }

  return null;
}

export const DASHBOARD_OVERDUE_ROUTE = `/orders?status=${OrderStatus.OVERDUE}`;
