"use client";

import { Role } from "@tbms/shared-types";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { TableSurface } from "@/components/ui/table-layout";
import { MyOrdersTable } from "@/components/orders/my-orders-table";
import { MyOrdersToolbar } from "@/components/orders/my-orders-toolbar";
import { useMyOrdersPage } from "@/hooks/use-my-orders-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function MyOrdersPage() {
  const {
    loading,
    search,
    items,
    filteredItems,
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
            filteredCount={filteredItems.length}
            onSearchChange={setSearchFilter}
            onClearSearch={clearSearch}
          />
          <MyOrdersTable items={filteredItems} loading={loading} />
        </TableSurface>
      </PageSection>
    </PageShell>
  );
}

export default withRoleGuard(MyOrdersPage, {
  roles: [Role.EMPLOYEE],
  all: ["orders.read"],
});
