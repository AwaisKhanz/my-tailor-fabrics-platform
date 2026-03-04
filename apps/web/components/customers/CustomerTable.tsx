"use client";

import { useRouter } from "next/navigation";
import { Crown, MessageCircleMore, Users } from "lucide-react";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { CustomersDirectoryTable } from "@/components/customers/list/customers-directory-table";
import { CustomersListToolbar } from "@/components/customers/list/customers-list-toolbar";
import { CustomersPageHeader } from "@/components/customers/list/customers-page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { TableSurface } from "@/components/ui/table-layout";
import { useCustomersPage } from "@/hooks/use-customers-page";
import { useAuthz } from "@/hooks/use-authz";

export function CustomerTable() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canCreateCustomer = canAll(["customers.create"]);
  const canEditCustomer = canAll(["customers.update"]);

  const {
    loading,
    customers,
    total,
    summary,
    search,
    page,
    pageSize,
    statusTab,
    isDialogOpen,
    selectedCustomer,
    hasActiveFilters,
    setPage,
    setSearchFilter,
    setStatusFilter,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    fetchCustomers,
  } = useCustomersPage();

  return (
    <PageShell spacing="default">
      <CustomersPageHeader
        onAddCustomer={openCreateDialog}
        canCreateCustomer={canCreateCustomer}
      />

      <PageSection
        spacing="compact"
        className="grid auto-rows-fr space-y-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <StatCard
          title="Total Customers"
          subtitle="Directory coverage"
          value={summary.totalCustomers}
          tone="primary"
          icon={<Users className="h-4 w-4" />}
        />

        <StatCard
          title="WhatsApp Connected"
          subtitle="Communication ready"
          value={summary.whatsappConnectedCount}
          tone="success"
          icon={<MessageCircleMore className="h-4 w-4" />}
        />

        <StatCard
          title="VIP Customers"
          subtitle="Premium segment"
          value={summary.vipCustomersCount}
          tone="warning"
          icon={<Crown className="h-4 w-4" />}
          className="sm:col-span-2 xl:col-span-1"
        />
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface className="border-border/70 bg-card/95">
          <CustomersListToolbar
            total={total}
            search={search}
            statusTab={statusTab}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearchFilter}
            onStatusChange={setStatusFilter}
            onReset={resetFilters}
          />

          <CustomersDirectoryTable
            customers={customers}
            loading={loading}
            page={page}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onView={(customer) => {
              router.push(`/customers/${customer.id}`);
            }}
            onEdit={openEditDialog}
            canEditCustomer={canEditCustomer}
          />
        </TableSurface>
      </PageSection>

      {canCreateCustomer || canEditCustomer ? (
        <CustomerDialog
          open={isDialogOpen}
          onOpenChange={closeDialog}
          customer={selectedCustomer}
          onSuccess={() => {
            void fetchCustomers();
          }}
        />
      ) : null}
    </PageShell>
  );
}
