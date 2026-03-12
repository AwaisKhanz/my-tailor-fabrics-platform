"use client";

import { useRouter } from "next/navigation";
import { Crown, MessageCircleMore, Users } from "lucide-react";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { CustomersDirectoryTable } from "@/components/customers/list/customers-directory-table";
import { CustomersListToolbar } from "@/components/customers/list/customers-list-toolbar";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { TableSurface } from "@tbms/ui/components/table-layout";
import { useCustomersPage } from "@/hooks/use-customers-page";
import { useAuthz } from "@/hooks/use-authz";
import { buildCustomerDetailRoute } from "@/lib/people-routes";
import { PERMISSION } from "@tbms/shared-constants";

export function CustomerTable() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canCreateCustomer = canAll([PERMISSION["customers.create"]]);
  const canEditCustomer = canAll([PERMISSION["customers.update"]]);

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
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Customers"
          description="Manage client records, sizing history, and communication status from one directory."
          actions={
            canCreateCustomer ? (
              <Button onClick={openCreateDialog} variant="default">
                <Users className="h-4 w-4" />
                New Customer
              </Button>
            ) : null
          }
        />
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="three">
          <StatCard
            title="Total Customers"
            subtitle="Full active directory"
            value={summary.totalCustomers.toLocaleString()}
            badgeText="Directory"
            tone="info"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="WhatsApp Connected"
            subtitle="Reachable via WhatsApp"
            value={summary.whatsappConnectedCount.toLocaleString()}
            badgeText="Active"
            tone="success"
            icon={<MessageCircleMore className="h-4 w-4" />}
          />
          <StatCard
            title="VIP Customers"
            subtitle="Premium priority clients"
            value={summary.vipCustomersCount.toLocaleString()}
            badgeText="Premium"
            tone="warning"
            icon={<Crown className="h-4 w-4" />}
          />
        </StatsGrid>
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
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
              router.push(buildCustomerDetailRoute(customer.id));
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
