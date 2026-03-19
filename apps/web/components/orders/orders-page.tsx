"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Plus,
  Wallet,
} from "lucide-react";
import { Can } from "@/components/auth/can";
import { OrdersListTable } from "@/components/orders/orders-list-table";
import { OrdersListToolbar } from "@/components/orders/orders-list-toolbar";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { TableSurface } from "@tbms/ui/components/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useOrdersListPage } from "@/hooks/use-orders-list-page";
import {
  buildEditOrderRoute,
  buildOrderDetailRoute,
  NEW_ORDER_ROUTE,
} from "@/lib/order-routes";
import { formatPKR } from "@/lib/utils";
import { PERMISSION } from "@tbms/shared-constants";

export function OrdersPage() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canEditOrder = canAll([PERMISSION["orders.update"]]);
  const canPrintReceipt = canAll([PERMISSION["orders.receipt"]]);

  const {
    loading,
    orders,
    total,
    page,
    pageSize,
    search,
    statusFilter,
    dateRange,
    sortBy,
    sortOrder,
    activeFilterCount,
    summary,
    setPage,
    setSearchFilter,
    setStatus,
    setDate,
    setSort,
    resetFilters,
  } = useOrdersListPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Orders"
          description="Manage customer orders and production workflow from one place."
          actions={
            <Can all={[PERMISSION["orders.create"]]}>
              <Button
                variant="default"
                onClick={() => router.push(NEW_ORDER_ROUTE)}
              >
                <Plus className="h-4 w-4" />
                New Order
              </Button>
            </Can>
          }
          surface="card"
          density="compact"
        />
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="four">
          <StatCard
            title="Booked Value"
            subtitle="Non-cancelled orders in current result set"
            value={formatPKR(summary.totalValue)}
            badgeText="Value"
            tone="primary"
            icon={<Wallet className="h-4 w-4" />}
          />
          <StatCard
            title="Due in 7 Days"
            subtitle="Upcoming delivery load"
            value={summary.dueSoonCount.toLocaleString()}
            badgeText="Upcoming"
            tone="warning"
            icon={<Clock3 className="h-4 w-4" />}
          />
          <StatCard
            title="Overdue"
            subtitle="Needs immediate action"
            value={summary.overdueCount.toLocaleString()}
            badgeText="Action"
            tone="destructive"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <StatCard
            title="Completed"
            subtitle="Delivered or closed"
            value={summary.completedCount.toLocaleString()}
            badgeText="Delivered"
            tone="success"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </StatsGrid>
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
          <OrdersListToolbar
            total={total}
            search={search}
            statusFilter={statusFilter}
            dateRange={dateRange}
            activeFilterCount={activeFilterCount}
            onSearchChange={setSearchFilter}
            onStatusChange={setStatus}
            onDateRangeChange={setDate}
            onReset={resetFilters}
          />

          <OrdersListTable
            orders={orders}
            loading={loading}
            page={page}
            total={total}
            limit={pageSize}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={setSort}
            onPageChange={setPage}
            onViewOrder={(orderId) => router.push(buildOrderDetailRoute(orderId))}
            onEditOrder={(orderId) => router.push(buildEditOrderRoute(orderId))}
            canEditOrder={canEditOrder}
            canPrintReceipt={canPrintReceipt}
          />
        </TableSurface>
      </PageSection>
    </PageShell>
  );
}
