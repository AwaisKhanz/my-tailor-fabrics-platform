"use client";

import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { TableSurface } from "@/components/ui/table-layout";
import { MyOrdersTable } from "@/components/orders/my-orders-table";
import { MyOrdersToolbar } from "@/components/orders/my-orders-toolbar";
import { useMyOrdersPage } from "@/hooks/use-my-orders-page";

export function MyOrdersPage() {
  const {
    loading,
    page,
    pageSize,
    search,
    items,
    filteredTotal,
    pagedItems,
    setPage,
    setSearchFilter,
    clearSearch,
  } = useMyOrdersPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="My Work Orders"
          description="Review and manage your assigned tailoring tasks."
          density="compact"
        />
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
          <MyOrdersToolbar
            search={search}
            totalCount={items.length}
            filteredCount={filteredTotal}
            onSearchChange={setSearchFilter}
            onClearSearch={clearSearch}
          />
          <MyOrdersTable
            items={pagedItems}
            loading={loading}
            page={page}
            total={filteredTotal}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </TableSurface>
      </PageSection>
    </PageShell>
  );
}
