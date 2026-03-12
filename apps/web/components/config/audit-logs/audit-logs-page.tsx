"use client";

import { useMemo } from "react";
import type { AuditLogEntry } from "@tbms/shared-types";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { TableSurface } from "@tbms/ui/components/table-layout";
import {
  AUDIT_ALL_ACTIONS_LABEL,
  AUDIT_ALL_ENTITIES_LABEL,
  useAuditLogsPage,
} from "@/hooks/use-audit-logs-page";
import { AuditLogsFilterToolbar } from "@/components/config/audit-logs/audit-logs-filter-toolbar";
import { AuditLogsPageHeader } from "@/components/config/audit-logs/audit-logs-page-header";
import { AuditLogsStatsGrid } from "@/components/config/audit-logs/audit-logs-stats-grid";
import { createAuditLogColumns } from "@/components/config/audit-logs/audit-log-table-columns";
import { resolveUpdater } from "@/lib/tanstack";

export function AuditLogsPage() {
  const {
    loading,
    records,
    total,
    stats,
    page,
    pageSize,
    filters,
    activeFilterCount,
    actionFilterOptions,
    entityFilterOptions,
    setPage,
    setFilter,
    resetFilters,
    refresh,
  } = useAuditLogsPage();

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => createAuditLogColumns(),
    [],
  );
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    }),
    [page, pageSize],
  );
  const sorting = useMemo<SortingState>(() => [], []);
  const handlePaginationChange = useMemo<OnChangeFn<PaginationState>>(
    () => (updater) => {
      const next =
        resolveUpdater(updater, pagination);
      setPage(next.pageIndex + 1);
    },
    [pagination, setPage],
  );
  const handleSortingChange = useMemo<OnChangeFn<SortingState>>(
    () => () => {
      return;
    },
    [],
  );
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <PageShell>
      <PageSection spacing="compact">
        <AuditLogsPageHeader onRefresh={() => void refresh()} />
      </PageSection>

      <PageSection spacing="compact">
        <AuditLogsStatsGrid stats={stats} />
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
          <AuditLogsFilterToolbar
            total={total}
            activeFilterCount={activeFilterCount}
            filters={filters}
            actionFilterOptions={actionFilterOptions}
            entityFilterOptions={entityFilterOptions}
            allActionsLabel={AUDIT_ALL_ACTIONS_LABEL}
            allEntitiesLabel={AUDIT_ALL_ENTITIES_LABEL}
            onSetFilter={setFilter}
            onResetFilters={resetFilters}
          />
          <DataTableTanstack
            columns={columns}
            data={records}
            loading={loading}
            emptyMessage="No audit events found for the selected filters."
            itemLabel="events"
            chrome="flat"
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            pageCount={pageCount}
            totalCount={total}
            manualPagination
            sorting={sorting}
            onSortingChange={handleSortingChange}
          />
        </TableSurface>
      </PageSection>
    </PageShell>
  );
}
