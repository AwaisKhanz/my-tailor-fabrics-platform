"use client";

import { useMemo } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Edit2, Package2, Plus, RefreshCcw, Tags } from "lucide-react";
import { PERMISSION } from "@tbms/shared-constants";
import { type ShopFabric } from "@tbms/shared-types";
import { FabricFormDialog } from "@/components/fabrics/fabric-form-dialog";
import { SetupFlowBanner } from "@/components/config/setup/setup-flow-banner";
import { useAuthz } from "@/hooks/use-authz";
import { useFabricsPage } from "@/hooks/use-fabrics-page";
import { formatPKR } from "@/lib/utils";
import { resolveUpdater } from "@/lib/tanstack";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { PageHeader } from "@tbms/ui/components/page-header";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import {
  TableSearch,
  TableSurface,
  TableToolbar,
} from "@tbms/ui/components/table-layout";

export function FabricsPage() {
  const { canAll } = useAuthz();
  const canManageFabrics = canAll([PERMISSION["fabrics.manage"]]);

  const {
    loading,
    saving,
    fabrics,
    totalCount,
    currentPage,
    itemsPerPage,
    search,
    hasActiveFilters,
    stats,
    branches,
    branchMap,
    branchSelectDisabled,
    dialogOpen,
    editingFabric,
    fabricForm,
    formError,
    fieldErrors,
    setSearchFilter,
    setPage,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    handleDialogOpenChange,
    updateFabricField,
    saveFabric,
  } = useFabricsPage();

  const columns = useMemo<ColumnDef<ShopFabric>[]>(
    () => [
      {
        id: "fabric",
        header: "Fabric",
        cell: ({ row }) => (
          <div className="min-w-[240px] space-y-1">
            <div className="font-semibold text-foreground">{row.original.name}</div>
            {row.original.brand ? (
              <div className="text-xs text-muted-foreground">{row.original.brand}</div>
            ) : null}
          </div>
        ),
      },
      {
        id: "branch",
        header: "Branch",
        cell: ({ row }) => {
          const branch = branchMap.get(row.original.branchId);
          return branch ? (
            <div className="space-y-1">
              <div className="font-medium text-foreground">{branch.name}</div>
              <div className="text-xs text-muted-foreground">{branch.code}</div>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Unknown branch</span>
          );
        },
      },
      {
        id: "rate",
        header: () => <div className="text-right">Selling Rate</div>,
        cell: ({ row }) => (
          <div className="text-right font-semibold text-foreground">
            {formatPKR(row.original.sellingRate)}
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "outline"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) =>
          canManageFabrics ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  openEditDialog(row.original);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null,
      },
    ],
    [branchMap, canManageFabrics, openEditDialog],
  );

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(currentPage - 1, 0),
      pageSize: itemsPerPage,
    }),
    [currentPage, itemsPerPage],
  );
  const pageCount = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const sorting = useMemo<SortingState>(() => [], []);
  const handleSortingChange = useMemo<OnChangeFn<SortingState>>(
    () => () => {
      return;
    },
    [],
  );
  const handlePaginationChange = useMemo<OnChangeFn<PaginationState>>(
    () => (updater) => {
      const next = resolveUpdater(updater, pagination);
      setPage(next.pageIndex + 1);
    },
    [pagination, setPage],
  );

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Fabric Pricing"
          description="Manage branch-level fabric names, brands, and selling rates used by the piece-first order wizard."
          actions={
            canManageFabrics ? (
              <Button type="button" variant="default" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Add Fabric
              </Button>
            ) : null
          }
        />
      </PageSection>

      <PageSection spacing="compact">
        <SetupFlowBanner
          title="Optional pricing layer for shop fabric"
          description="Fabric pricing is only needed when the shop supplies cloth. The order wizard will use these branch prices automatically."
          currentStep="Fabric Pricing"
          previousStep="Branches and garments should already be ready"
          nextStep="Orders can apply shop-fabric charges without manual typing"
          sequence={["Measurements", "Garments", "Fabric Pricing", "Labor Rates", "Orders"]}
        />
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="three">
          <StatCard
            title="Catalog Items"
            subtitle="Current branch pricing records"
            value={stats.totalItems.toLocaleString()}
            helperText="Every fabric entry available to the order wizard"
            icon={<Package2 className="h-4 w-4" />}
          />
          <StatCard
            title="Active"
            subtitle="Ready at the counter"
            value={stats.activeItems.toLocaleString()}
            helperText="Visible in the shop-fabric picker for pieces"
            tone="success"
          />
          <StatCard
            title="Inactive"
            subtitle="Hidden from new orders"
            value={stats.inactiveItems.toLocaleString()}
            helperText="Kept for record continuity and later reactivation"
            tone="warning"
            icon={<Tags className="h-4 w-4" />}
          />
        </StatsGrid>
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
          <TableToolbar
            title="Fabric Directory"
            total={totalCount}
            totalLabel="fabrics"
            activeFilterCount={hasActiveFilters ? 1 : 0}
            controls={
              <>
                <TableSearch
                  placeholder="Search fabric or brand..."
                  value={search}
                  onChange={(event) => setSearchFilter(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </Button>
              </>
            }
          />

          <DataTableTanstack
            columns={columns}
            data={fabrics}
            loading={loading}
            itemLabel="fabrics"
            emptyMessage="No fabric pricing records found for this branch yet."
            chrome="flat"
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            pageCount={pageCount}
            totalCount={totalCount}
            manualPagination
            sorting={sorting}
            onSortingChange={handleSortingChange}
          />
        </TableSurface>
      </PageSection>

      <FabricFormDialog
        open={dialogOpen}
        editingFabric={editingFabric}
        saving={saving}
        branches={branches}
        branchSelectDisabled={branchSelectDisabled}
        form={fabricForm}
        formError={formError}
        fieldErrors={fieldErrors}
        onOpenChange={handleDialogOpenChange}
        onUpdateField={updateFabricField}
        onSubmit={saveFabric}
      />
    </PageShell>
  );
}
