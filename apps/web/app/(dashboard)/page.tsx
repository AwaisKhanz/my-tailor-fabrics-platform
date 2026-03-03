"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Banknote, Plus, ReceiptText, ShoppingBag, Wallet } from "lucide-react";
import { Role } from "@tbms/shared-types";
import { formatPKR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import { DashboardKpiCard } from "@/components/dashboard/dashboard-kpi-card";
import {
  DASHBOARD_OVERDUE_ROUTE,
  DashboardOverdueBanner,
} from "@/components/dashboard/dashboard-overdue-banner";
import { DashboardRevenueExpensesCard } from "@/components/dashboard/dashboard-revenue-expenses-card";
import { DashboardGarmentBreakdownCard } from "@/components/dashboard/dashboard-garment-breakdown-card";
import { DashboardDesignPopularityCard } from "@/components/dashboard/dashboard-design-popularity-card";
import {
  DashboardOverdueOrdersCard,
  OVERDUE_ORDERS_QUERY,
} from "@/components/dashboard/dashboard-overdue-orders-card";
import { DashboardProductivityCard } from "@/components/dashboard/dashboard-productivity-card";
import { PageShell, PageSection } from "@/components/ui/page-shell";
import { Typography } from "@/components/ui/typography";

export default function DashboardPage() {
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

  const roleLabel = session?.user?.role
    ? session.user.role === Role.SUPER_ADMIN
      ? "Super Admin"
      : session.user.role.replace("_", " ")
    : undefined;

  return (
    <PageShell spacing="spacious">
      <PageHeader
        title="Dashboard"
        description={
          <span className="text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{session?.user?.email}</span>
            {session?.user?.role ? (
              <Badge variant="admin" size="xs" className="ml-2">
                {roleLabel}
              </Badge>
            ) : null}
          </span>
        }
        actions={
          <>
            <Button
              variant="premium"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => router.push("/orders/new")}
            >
              <Plus className="h-4 w-4" />
              New Order
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full border-primary/30 bg-primary/5 font-semibold text-primary sm:w-auto"
              onClick={() => router.push("/reports")}
            >
              Open Reports
            </Button>
          </>
        }
      />

      <PageSection spacing="none" className="space-y-1">
        <Typography as="h2" variant="sectionTitle" className="text-base sm:text-lg">
          Today Overview
        </Typography>
        <Typography as="p" variant="muted" className="text-xs sm:text-sm">
          Key numbers for revenue, expenses, balances, and new orders.
        </Typography>
      </PageSection>

      <PageSection spacing="compact">
        <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        </div>
      </PageSection>

      <PageSection spacing="compact">
        <DashboardOverdueBanner
          loading={loading}
          error={error}
          stats={stats}
          onViewOverdue={() => router.push(DASHBOARD_OVERDUE_ROUTE)}
        />
      </PageSection>

      <PageSection spacing="none" className="pt-1">
        <Typography as="h2" variant="sectionTitle" className="text-base sm:text-lg">
          Financial Insights
        </Typography>
      </PageSection>

      <PageSection className="grid grid-cols-1 space-y-0 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8 h-full">
          <DashboardRevenueExpensesCard rows={revenueExpenseRows} />
        </div>
        <div className="xl:col-span-4">
          <DashboardGarmentBreakdownCard garments={garments} totalItems={totalGarmentItems} />
        </div>
      </PageSection>

      <PageSection className="grid grid-cols-1 space-y-0 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4 h-full">
          <DashboardDesignPopularityCard
            loading={loading}
            designs={designs}
            onViewAnalytics={() => router.push("/reports")}
          />
        </div>
        <div className="xl:col-span-8 h-full">
          <DashboardProductivityCard loading={loading} productivity={productivity} />
        </div>
      </PageSection>

      <PageSection spacing="none">
        <Typography as="h2" variant="sectionTitle" className="text-base sm:text-lg">
          Operational Attention
        </Typography>
      </PageSection>

      <PageSection>
        <DashboardOverdueOrdersCard
          orders={stats?.recentOrders ?? []}
          onViewOverdueOrders={() => router.push(OVERDUE_ORDERS_QUERY)}
          onOpenOrder={(orderId) => router.push(`/orders/${orderId}`)}
        />
      </PageSection>
    </PageShell>
  );
}
