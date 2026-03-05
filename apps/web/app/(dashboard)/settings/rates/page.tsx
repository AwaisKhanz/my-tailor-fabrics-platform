"use client";

import { CreateRateDialog } from "@/components/rates/CreateRateDialog";
import { RatesPageHeader } from "@/components/rates/rates-page-header";
import { RatesSearchStats } from "@/components/rates/rates-search-stats";
import { RatesStatsGrid } from "@/components/rates/rates-stats-grid";
import { RatesTable } from "@/components/rates/rates-table";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { TableSurface } from "@/components/ui/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useRatesPage } from "@/hooks/use-rates-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function RatesPage() {
  const { canAll } = useAuthz();
  const canManageRates = canAll(["rates.manage"]);

  const {
    loading,
    rates,
    total,
    stats,
    page,
    pageSize,
    search,
    hasActiveFilters,
    garmentTypes,
    branches,
    createDialogOpen,
    stepKeysByGarmentId,
    setPage,
    setSearchFilter,
    clearSearch,
    setCreateDialogOpen,
    createRate,
  } = useRatesPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <RatesPageHeader
          onCreate={() => setCreateDialogOpen(true)}
          canCreateRate={canManageRates}
        />
      </PageSection>

      <PageSection spacing="compact">
        <RatesStatsGrid
          stats={stats}
          visibleOnPage={rates.length}
          hasActiveFilters={hasActiveFilters}
        />
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
          <RatesSearchStats
            search={search}
            total={total}
            onSearchChange={setSearchFilter}
            onClearSearch={clearSearch}
          />

          <RatesTable
            rates={rates}
            loading={loading}
            page={page}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </TableSurface>
      </PageSection>

      {canManageRates ? (
        <CreateRateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={createRate}
          garmentTypes={garmentTypes.map((garment) => ({ id: garment.id, name: garment.name }))}
          branches={branches.map((branch) => ({ id: branch.id, name: branch.name, code: branch.code }))}
          stepsByGarmentTypeId={stepKeysByGarmentId}
        />
      ) : null}
    </PageShell>
  );
}

export default withRoleGuard(RatesPage, {
  all: ["settings.read", "rates.read"],
});
