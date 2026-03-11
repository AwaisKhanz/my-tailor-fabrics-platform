"use client";

import { CreateRateDialog } from "@/components/rates/CreateRateDialog";
import { RatesPageHeader } from "@/components/rates/rates-page-header";
import { RatesSearchStats } from "@/components/rates/rates-search-stats";
import { RatesStatsGrid } from "@/components/rates/rates-stats-grid";
import { RatesTable } from "@/components/rates/rates-table";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { TableSurface } from "@tbms/ui/components/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useRatesPage } from "@/hooks/use-rates-page";
import { PERMISSION } from "@tbms/shared-constants";

export function RatesPage() {
  const { canAll } = useAuthz();
  const canManageRates = canAll([PERMISSION["rates.manage"]]);

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
    selectedRateForAdjust,
    stepKeysByGarmentId,
    setPage,
    setSearchFilter,
    clearSearch,
    setCreateDialogOpen,
    openCreateRateDialog,
    openAdjustRateDialog,
    createRate,
  } = useRatesPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <RatesPageHeader
          onCreate={openCreateRateDialog}
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
            onAdjustRate={canManageRates ? openAdjustRateDialog : undefined}
          />
        </TableSurface>
      </PageSection>

      {canManageRates ? (
        <CreateRateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={createRate}
          garmentTypes={garmentTypes.map((garment) => ({
            id: garment.id,
            name: garment.name,
          }))}
          branches={branches.map((branch) => ({
            id: branch.id,
            name: branch.name,
            code: branch.code,
          }))}
          stepsByGarmentTypeId={stepKeysByGarmentId}
          mode={selectedRateForAdjust ? "adjust" : "create"}
          initialRate={selectedRateForAdjust}
        />
      ) : null}
    </PageShell>
  );
}
