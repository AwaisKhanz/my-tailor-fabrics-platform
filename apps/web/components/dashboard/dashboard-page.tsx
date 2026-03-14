"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertTriangle, Plus } from "lucide-react";
import { Can } from "@/components/auth/can";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { Card, CardContent } from "@tbms/ui/components/card";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import { REPORTS_ROUTE } from "@/lib/finance-routes";
import { buildOrderDetailRoute, NEW_ORDER_ROUTE } from "@/lib/order-routes";
import { isRole, PERMISSION, ROLE_LABELS } from "@tbms/shared-constants";
import {
  DashboardChartAreaInteractive,
  type DashboardRevenueExpensesPoint,
} from "@/components/dashboard/chart-area-interactive";
import { DashboardDataTable } from "@/components/dashboard/data-table";
import { DashboardSectionCards } from "@/components/dashboard/section-cards";
import { DashboardTopGarmentsTable } from "@/components/dashboard/top-garments-table";

export function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const {
    loading,
    refreshing,
    error,
    stats,
    revenueExpenseRows,
    garments,
    refreshDashboard,
  } = useDashboardPage();

  const role = session?.user?.role;
  const roleLabel = role && isRole(role) ? ROLE_LABELS[role] : undefined;
  const userLabel = session?.user?.name || "Team";

  const chartData: DashboardRevenueExpensesPoint[] = revenueExpenseRows;

  return (
    <PageShell>
      <PageSection spacing="default">
        <PageHeader
          title="Dashboard"
          description={
            <span>
              Welcome back,{" "}
              <span className="font-medium text-foreground">{userLabel}</span>
              {roleLabel ? (
                <Badge variant="outline" className="ml-2 align-middle">
                  {roleLabel}
                </Badge>
              ) : null}
            </span>
          }
          actions={
            <>
              <Can all={[PERMISSION["orders.create"]]}>
                <Button onClick={() => router.push(NEW_ORDER_ROUTE)}>
                  <Plus className="h-4 w-4" />
                  New Order
                </Button>
              </Can>
              <Can all={[PERMISSION["reports.read"]]}>
                <Button
                  variant="outline"
                  onClick={() => router.push(REPORTS_ROUTE)}
                >
                  Open Reports
                </Button>
              </Can>
            </>
          }
          surface="card"
          density="compact"
        />
      </PageSection>

      {error ? (
        <PageSection spacing="default">
          <Card className="border-destructive/25 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-5">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Dashboard data is partially unavailable
                </p>
                <p className="text-sm text-muted-foreground">
                  Some cards may show incomplete values until services recover.
                </p>
              </div>
            </CardContent>
          </Card>
        </PageSection>
      ) : null}

      <PageSection spacing="default">
        <DashboardSectionCards loading={loading} stats={stats} />
      </PageSection>

      <PageSection spacing="default">
        <DashboardChartAreaInteractive
          data={chartData}
          refreshing={refreshing}
          onRefresh={() => {
            void refreshDashboard();
          }}
          onConfigure={() => router.push(REPORTS_ROUTE)}
        />
      </PageSection>

      <PageSection spacing="default">
        <DashboardTopGarmentsTable loading={loading} garments={garments} />
      </PageSection>

      <PageSection spacing="default">
        <DashboardDataTable
          orders={stats?.recentOrders ?? []}
          onOpenOrder={(orderId) => router.push(buildOrderDetailRoute(orderId))}
        />
      </PageSection>
    </PageShell>
  );
}
