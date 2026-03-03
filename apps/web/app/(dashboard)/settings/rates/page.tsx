"use client";

import { CreateRateDialog } from "@/components/rates/CreateRateDialog";
import { RatesPageHeader } from "@/components/rates/rates-page-header";
import { RatesSearchStats } from "@/components/rates/rates-search-stats";
import { RatesStatsGrid } from "@/components/rates/rates-stats-grid";
import { RatesTable } from "@/components/rates/rates-table";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { TableSurface } from "@/components/ui/table-layout";
import { useRatesPage } from "@/hooks/use-rates-page";

export default function RatesPage() {
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
    stepKeys,
    setPage,
    setSearchFilter,
    clearSearch,
    setCreateDialogOpen,
    createRate,
  } = useRatesPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <RatesPageHeader onCreate={() => setCreateDialogOpen(true)} />
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

      <CreateRateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={createRate}
        garmentTypes={garmentTypes.map((garment) => ({ id: garment.id, name: garment.name }))}
        branches={branches.map((branch) => ({ id: branch.id, name: branch.name, code: branch.code }))}
        steps={stepKeys}
      />
    </PageShell>
  );
}
