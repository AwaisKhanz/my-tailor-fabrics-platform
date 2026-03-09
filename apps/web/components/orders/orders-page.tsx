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
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { TableSurface } from "@/components/ui/table-layout";
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
    activeFilterCount,
    summary,
    setPage,
    setSearchFilter,
    setStatus,
    setDate,
    resetFilters,
  } = useOrdersListPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Orders"
          description="Manage customer orders and production workflow from one place."
          density="compact"
          actions={
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
          }
        />
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="four" flushSectionSpacing>
          <StatCard
            title="Filtered Value"
            subtitle="Current query amount"
            value={formatPKR(summary.totalValue)}
            tone="primary"
            icon={<Wallet className="h-4 w-4" />}
          />

          <StatCard
            title="Due in 7 Days"
            subtitle="Upcoming commitments"
            value={summary.dueSoonCount}
            tone="warning"
            icon={<Clock3 className="h-4 w-4" />}
          />

          <StatCard
            title="Overdue"
            subtitle="Requires action"
            value={summary.overdueCount}
            tone="destructive"
            icon={<AlertTriangle className="h-4 w-4" />}
          />

          <StatCard
            title="Completed"
            subtitle="Delivered workflow"
            value={summary.completedCount}
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
