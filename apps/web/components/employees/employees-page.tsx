"use client";

import { useRouter } from "next/navigation";
import { Filter, Plus, Users2, UserSquare2 } from "lucide-react";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { EmployeesListTable } from "@/components/employees/list/employees-list-table";
import { EmployeesListToolbar } from "@/components/employees/list/employees-list-toolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { TableSurface } from "@/components/ui/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useEmployeesPage } from "@/hooks/use-employees-page";
import { buildEmployeeDetailRoute } from "@/lib/people-routes";
import { PERMISSION } from "@tbms/shared-constants";

export function EmployeesPage() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canManageEmployees = canAll([PERMISSION["employees.manage"]]);

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
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Employees"
          description="Manage team records, assignments, and staff visibility from one directory."
          density="compact"
          actions={
            canManageEmployees ? (
              <Button
                variant="default"
                size="lg"
                className="w-full sm:w-auto"
                onClick={openAddDialog}
              >
                <Plus className="h-4 w-4" />
                New Employee
              </Button>
            ) : null
          }
        />
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="three" flushSectionSpacing>
          <StatCard
            title="Total Employees"
            subtitle="Across current branch"
            value={total}
            tone="primary"
            icon={<Users2 className="h-4 w-4" />}
          />

          <StatCard
            title="Showing"
            subtitle={`Rows on page ${page}`}
            value={employees.length}
            tone="info"
            icon={<UserSquare2 className="h-4 w-4" />}
          />

          <StatCard
            title="Filters"
            subtitle={
              hasActiveFilters ? "Search applied" : "No filters applied"
            }
            value={hasActiveFilters ? "Active" : "Default"}
            tone="warning"
            icon={<Filter className="h-4 w-4" />}
            className="sm:col-span-2 xl:col-span-1"
          />
        </StatsGrid>
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
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
            onViewEmployee={(employee) =>
              router.push(buildEmployeeDetailRoute(employee.id))
            }
          />
        </TableSurface>
      </PageSection>

      {canManageEmployees ? (
        <EmployeeDialog
          open={addDialogOpen}
          onOpenChange={closeAddDialog}
          onSuccess={() => {
            void fetchEmployees();
          }}
        />
      ) : null}
    </PageShell>
  );
}
