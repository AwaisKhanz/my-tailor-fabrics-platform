"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock3, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/can";
import { StatCard } from "@/components/ui/stat-card";
import { formatPKR } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { TableSurface } from "@/components/ui/table-layout";
import { useOrdersListPage } from "@/hooks/use-orders-list-page";
import { OrdersListToolbar } from "@/components/orders/orders-list-toolbar";
import { OrdersListTable } from "@/components/orders/orders-list-table";
import { useAuthz } from "@/hooks/use-authz";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function OrdersPage() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canEditOrder = canAll(["orders.update"]);
  const canPrintReceipt = canAll(["orders.receipt"]);

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
      <PageHeader
        title="Orders"
        description="Manage customer orders and production workflow from one place."
        actions={
          <Can all={["orders.create"]}>
            <Button
              variant="premium"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => router.push("/orders/new")}
            >
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </Can>
        }
      />

      <PageSection
        spacing="compact"
        className="grid auto-rows-fr space-y-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
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
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface className="border-border/70 bg-card/95">
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
            onViewOrder={(orderId) => router.push(`/orders/${orderId}`)}
            onEditOrder={(orderId) => router.push(`/orders/new?edit=${orderId}`)}
            canEditOrder={canEditOrder}
            canPrintReceipt={canPrintReceipt}
          />
        </TableSurface>
      </PageSection>
    </PageShell>
  );
}

export default withRoleGuard(OrdersPage, { all: ["orders.read"] });
