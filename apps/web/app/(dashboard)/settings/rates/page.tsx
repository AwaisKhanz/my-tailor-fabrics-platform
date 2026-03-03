"use client";

import { useRouter } from "next/navigation";
import { CreateRateDialog } from "@/components/rates/CreateRateDialog";
import { RatesPageHeader } from "@/components/rates/rates-page-header";
import { RatesSearchStats } from "@/components/rates/rates-search-stats";
import { RatesTable } from "@/components/rates/rates-table";
import { PageShell } from "@/components/ui/page-shell";
import { TableSurface } from "@/components/ui/table-layout";
import { useRatesPage } from "@/hooks/use-rates-page";

export default function RatesPage() {
  const router = useRouter();

  const {
    loading,
    rates,
    total,
    page,
    pageSize,
    search,
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
      <RatesPageHeader onBack={() => router.back()} onCreate={() => setCreateDialogOpen(true)} />

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
