"use client";

import { useRouter } from "next/navigation";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { CustomersDirectoryTable } from "@/components/customers/list/customers-directory-table";
import { CustomersListToolbar } from "@/components/customers/list/customers-list-toolbar";
import { CustomersPageHeader } from "@/components/customers/list/customers-page-header";
import { TableSurface } from "@/components/ui/table-layout";
import { useCustomersPage } from "@/hooks/use-customers-page";

export function CustomerTable() {
  const router = useRouter();

  const {
    loading,
    customers,
    total,
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
    <div className="mx-auto max-w-9xl space-y-5">
      <CustomersPageHeader onAddCustomer={openCreateDialog} />

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
            router.push(`/customers/${customer.id}`);
          }}
          onEdit={openEditDialog}
        />
      </TableSurface>

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={closeDialog}
        customer={selectedCustomer}
        onSuccess={() => {
          void fetchCustomers();
        }}
      />
    </div>
  );
}
