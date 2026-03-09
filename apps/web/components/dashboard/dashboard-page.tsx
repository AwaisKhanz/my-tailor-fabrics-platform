"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Banknote, Plus, ReceiptText, ShoppingBag, Wallet } from "lucide-react";
import { Can } from "@/components/auth/can";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardOverdueBanner } from "@/components/dashboard/dashboard-overdue-banner";
import { DashboardOverdueOrdersCard } from "@/components/dashboard/dashboard-overdue-orders-card";
import { DashboardDesignPopularityCard } from "@/components/dashboard/dashboard-design-popularity-card";
import { DashboardGarmentBreakdownCard } from "@/components/dashboard/dashboard-garment-breakdown-card";
import { DashboardKpiCard } from "@/components/dashboard/dashboard-kpi-card";
import { DashboardProductivityCard } from "@/components/dashboard/dashboard-productivity-card";
import { DashboardRevenueExpensesCard } from "@/components/dashboard/dashboard-revenue-expenses-card";
import { PageHeader } from "@/components/ui/page-header";
import { DetailSplit, PageShell, PageSection } from "@/components/ui/page-shell";
import { StatsGrid } from "@/components/ui/stats-grid";
import { Heading, Text } from "@/components/ui/typography";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import { REPORTS_ROUTE } from "@/lib/finance-routes";
import {
  buildOrderDetailRoute,
  NEW_ORDER_ROUTE,
  OVERDUE_ORDERS_ROUTE,
} from "@/lib/order-routes";
import { formatPKR } from "@/lib/utils";
import { isRole, PERMISSION, ROLE_LABELS } from "@tbms/shared-constants";

export function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const {
    loading,
    error,
    stats,
    designs,
    productivity,
    garments,
    revenueExpenseRows,
    totalGarmentItems,
  } = useDashboardPage();

  const role = session?.user?.role;
  const roleLabel = role && isRole(role) ? ROLE_LABELS[role] : undefined;

  const userLabel = session?.user?.name ? session?.user?.name : undefined;

  return (
    <PageShell spacing="default">
      <PageSection spacing="compact">
        <PageHeader
          title="Dashboard"
          description={
            <span className="text-muted-foreground">
              Welcome back,{" "}
              <span className="font-medium text-foreground">{userLabel}</span>
              {session?.user?.role ? (
                <Badge variant="outline" size="xs" className="ml-2">
                  {roleLabel}
                </Badge>
              ) : null}
            </span>
          }
          density="default"
          actions={
            <>
              <Can all={[PERMISSION["orders.create"]]}>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => router.push(NEW_ORDER_ROUTE)}
                >
                  <Plus className="h-4 w-4" />
                  New Order
                </Button>
              </Can>
              <Can all={[PERMISSION["reports.read"]]}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full font-semibold sm:w-auto"
                  onClick={() => router.push(REPORTS_ROUTE)}
                >
                  Open Reports
                </Button>
              </Can>
            </>
          }
        />
      </PageSection>

      <PageSection spacing="none" className="space-y-1">
        <Heading as="h2" variant="section" className="text-base sm:text-lg">
          Today Overview
        </Heading>
        <Text as="p" variant="muted" className="text-xs sm:text-sm">
          Key numbers for revenue, expenses, balances, and new orders.
        </Text>
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="four">
          <DashboardKpiCard
            title="Total Revenue"
            loading={loading}
            value={formatPKR(stats?.revenue ?? 0)}
            icon={Banknote}
            badgeText="LIVE"
            badgeVariant="success"
            helperText="Confirmed inflow"
          />

          <DashboardKpiCard
            title="Expenses"
            loading={loading}
            value={formatPKR(stats?.expenses ?? 0)}
            icon={Wallet}
            badgeText="TRACKED"
            badgeVariant="info"
            helperText="Operational spend"
          />

          <DashboardKpiCard
            title="Outstanding Balance"
            loading={loading}
            value={formatPKR(stats?.outstandingBalances ?? 0)}
            icon={ReceiptText}
            badgeText="FOLLOW-UP"
            badgeVariant="destructive"
            helperText="Pending receivables"
          />

          <DashboardKpiCard
            title="New Today"
            loading={loading}
            value={stats?.newToday ?? 0}
            icon={ShoppingBag}
            badgeText="ORDERS"
            badgeVariant="info"
            helperText="Orders opened today"
          />
        </StatsGrid>
      </PageSection>

      <PageSection spacing="compact">
        <DashboardOverdueBanner
          loading={loading}
          error={error}
          stats={stats}
          onViewOverdue={() => router.push(OVERDUE_ORDERS_ROUTE)}
        />
      </PageSection>

      <PageSection spacing="none" className="pt-1">
        <Heading as="h2" variant="section" className="text-base sm:text-lg">
          Financial Insights
        </Heading>
      </PageSection>

      <PageSection>
        <DetailSplit
          ratio="3-2"
          mainClassName="h-full"
          sideClassName="h-full "
          main={<DashboardRevenueExpensesCard rows={revenueExpenseRows} />}
          side={
            <DashboardGarmentBreakdownCard
              garments={garments}
              totalItems={totalGarmentItems}
            />
          }
        />
      </PageSection>

      <PageSection>
        <DetailSplit
          ratio="3-2"
          mainClassName="order-2 lg:order-none h-full"
          sideClassName="order-1 lg:order-none h-full"
          main={
            <DashboardProductivityCard
              loading={loading}
              productivity={productivity}
            />
          }
          side={
            <DashboardDesignPopularityCard
              loading={loading}
              designs={designs}
              onViewAnalytics={() => router.push(REPORTS_ROUTE)}
            />
          }
        />
      </PageSection>

      <PageSection spacing="none">
        <Heading as="h2" variant="section" className="text-base sm:text-lg">
          Operational Attention
        </Heading>
      </PageSection>

      <PageSection>
        <DashboardOverdueOrdersCard
          orders={stats?.recentOrders ?? []}
          onViewOverdueOrders={() => router.push(OVERDUE_ORDERS_ROUTE)}
          onOpenOrder={(orderId) => router.push(buildOrderDetailRoute(orderId))}
        />
      </PageSection>
    </PageShell>
  );
}
