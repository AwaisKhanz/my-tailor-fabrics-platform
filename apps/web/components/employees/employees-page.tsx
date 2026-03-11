"use client";

import { useRouter } from "next/navigation";
import { Filter, Plus, Users2, UserSquare2 } from "lucide-react";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { EmployeesListTable } from "@/components/employees/list/employees-list-table";
import { EmployeesListToolbar } from "@/components/employees/list/employees-list-toolbar";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { TableSurface } from "@tbms/ui/components/table-layout";
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
          actions={
            canManageEmployees ? (
              <Button variant="default" onClick={openAddDialog}>
                <Plus className="h-4 w-4" />
                New Employee
              </Button>
            ) : null
          }
          surface="card"
          density="compact"
        />
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="three">
          <StatCard
            title="Total Employees"
            subtitle="Organization-wide roster"
            value={total.toLocaleString()}
            badgeText="Team"
            tone="info"
            icon={<Users2 className="h-4 w-4" />}
          />
          <StatCard
            title="Showing"
            subtitle="Current paginated set"
            value={employees.length.toLocaleString()}
            badgeText={`Page ${page}`}
            tone="primary"
            icon={<UserSquare2 className="h-4 w-4" />}
          />
          <StatCard
            title="Filters"
            subtitle="Current list query"
            value={hasActiveFilters ? "Active" : "Default"}
            badgeText={hasActiveFilters ? "Search applied" : "No filters"}
            tone={hasActiveFilters ? "warning" : "default"}
            icon={<Filter className="h-4 w-4" />}
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
