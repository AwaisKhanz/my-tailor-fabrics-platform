"use client";

import { PageHeader } from "@/components/ui/page-header";
import { MyOrdersTable } from "@/components/orders/my-orders-table";
import { MyOrdersToolbar } from "@/components/orders/my-orders-toolbar";
import { useMyOrdersPage } from "@/hooks/use-my-orders-page";

export default function MyOrdersPage() {
  const {
    loading,
    search,
    items,
    filteredItems,
    setSearchFilter,
    clearSearch,
  } = useMyOrdersPage();

  return (
    <div className="mx-auto max-w-9xl space-y-6">
      <PageHeader
        title="My Work Orders"
        description="Review and manage your assigned tailoring tasks."
      />

      <MyOrdersToolbar
        search={search}
        totalCount={items.length}
        filteredCount={filteredItems.length}
        onSearchChange={setSearchFilter}
        onClearSearch={clearSearch}
      />

      <MyOrdersTable items={filteredItems} loading={loading} />
    </div>
  );
}
