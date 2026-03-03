"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useOrdersListPage } from "@/hooks/use-orders-list-page";
import { OrdersListToolbar } from "@/components/orders/orders-list-toolbar";
import { OrdersListTable } from "@/components/orders/orders-list-table";

export default function OrdersPage() {
  const router = useRouter();

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
    setPage,
    setSearchFilter,
    setStatus,
    setDate,
    resetFilters,
  } = useOrdersListPage();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage customer orders and production workflow from one place."
        actions={
          <Button variant="premium" size="lg" onClick={() => router.push("/orders/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Order
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
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
        />
      </div>
    </div>
  );
}
