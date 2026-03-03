"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { EmployeesListTable } from "@/components/employees/list/employees-list-table";
import { EmployeesListToolbar } from "@/components/employees/list/employees-list-toolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useEmployeesPage } from "@/hooks/use-employees-page";

export default function EmployeesPage() {
  const router = useRouter();

  const {
    loading,
    employees,
    total,
    page,
    pageSize,
    search,
    addDialogOpen,
    hasActiveFilters,
    setPage,
    setSearchFilter,
    resetFilters,
    openAddDialog,
    closeAddDialog,
    fetchEmployees,
  } = useEmployeesPage();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your workshop staff and tailors."
        actions={
          <Button variant="premium" size="lg" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <EmployeesListToolbar
          total={total}
          search={search}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearchFilter}
          onReset={resetFilters}
        />

        <EmployeesListTable
          employees={employees}
          loading={loading}
          page={page}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onViewEmployee={(employee) => router.push(`/employees/${employee.id}`)}
        />
      </div>

      <EmployeeDialog
        open={addDialogOpen}
        onOpenChange={closeAddDialog}
        onSuccess={() => {
          void fetchEmployees();
        }}
      />
    </div>
  );
}
