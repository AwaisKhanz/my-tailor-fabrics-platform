"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Banknote, Users, ShoppingBag } from "lucide-react";
import { Role } from "@tbms/shared-types";
import { formatPKR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={
          <span className="text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{session?.user?.email}</span>
            {session?.user?.role ? (
              <Badge variant="admin" size="xs" className="ml-2">
                {session.user.role === Role.SUPER_ADMIN
                  ? "Super Admin"
                  : session.user.role.replace("_", " ")}
              </Badge>
            ) : null}
          </span>
        }
      />

      <DashboardOverdueBanner
        loading={loading}
        error={error}
        stats={stats}
        onViewOverdue={() => router.push(DASHBOARD_OVERDUE_ROUTE)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKpiCard
          title="Total Revenue"
          loading={loading}
          value={formatPKR(stats?.revenue ?? 0)}
          icon={Banknote}
          iconBoxClass="bg-success/10"
          iconClass="text-success"
          badgeText="LIVE"
          badgeVariant="success"
        />

        <DashboardKpiCard
          title="Active Employees"
          loading={loading}
          value={stats?.activeEmployees ?? 0}
          icon={Users}
          iconBoxClass="bg-primary/10"
          iconClass="text-primary"
        />

        <DashboardKpiCard
          title="Total Customers"
          loading={loading}
          value={stats?.totalCustomers ?? 0}
          icon={Users}
          iconBoxClass="bg-info/10"
          iconClass="text-info"
        />

        <DashboardKpiCard
          title="New Today"
          loading={loading}
          value={stats?.newToday ?? 0}
          icon={ShoppingBag}
          iconBoxClass="bg-warning/10"
          iconClass="text-warning"
          badgeText="Orders"
          badgeVariant="info"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardRevenueExpensesCard rows={revenueExpenseRows} />

        <DashboardGarmentBreakdownCard garments={garments} totalItems={totalGarmentItems} />

        <DashboardDesignPopularityCard
          loading={loading}
          designs={designs}
          onViewAnalytics={() => router.push("/reports")}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 pb-12 lg:grid-cols-3">
        <DashboardOverdueOrdersCard
          orders={stats?.recentOrders ?? []}
          onViewOverdueOrders={() => router.push(OVERDUE_ORDERS_QUERY)}
          onOpenOrder={(orderId) => router.push(`/orders/${orderId}`)}
        />

        <DashboardProductivityCard loading={loading} productivity={productivity} />
      </div>
    </div>
  );
}
