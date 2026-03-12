import { useCallback, useMemo } from "react";
import {
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { FolderPlus, RotateCcw, Search } from "lucide-react";
import {
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import {
  TableSearch,
  TableSurface,
  TableToolbar,
} from "@tbms/ui/components/table-layout";
import { useMeasurementSectionsManager } from "@/hooks/use-measurement-sections-manager";
import { resolveUpdater } from "@/lib/tanstack";

interface MeasurementSectionsManagerProps {
  sections: MeasurementSection[];
  fields: MeasurementField[];
  loading?: boolean;
  showArchived?: boolean;
  canManageSections?: boolean;
  onAddSection: () => void;
  onEditSection: (section: MeasurementSection) => void;
  onDeleteSection: (section: MeasurementSection) => void;
  onRestoreSection?: (section: MeasurementSection) => void;
  onAddFieldToSection: (sectionId: string) => void;
}

export function MeasurementSectionsManager({
  sections,
  fields,
  loading = false,
  showArchived = false,
  canManageSections = true,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onRestoreSection,
  onAddFieldToSection,
}: MeasurementSectionsManagerProps) {
  const {
    search,
    page,
    pageSize,
    total,
    hasActiveFilters,
    pagedRows,
    columns,
    setPage,
    updateSearch,
    resetFilters,
  } = useMeasurementSectionsManager({
    sections,
    fields,
    showArchived,
    canManageSections,
    onEditSection,
    onDeleteSection,
    onRestoreSection,
    onAddFieldToSection,
  });

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    }),
    [page, pageSize],
  );
  const onPaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = resolveUpdater(updater, pagination);
      setPage(next.pageIndex + 1);
    },
    [pagination, setPage],
  );
  const sorting = useMemo<SortingState>(() => [], []);
  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      void updater;
    },
    [],
  );

  return (
    <TableSurface>
      <TableToolbar
        title="Measurement Sections"
        total={total}
        totalLabel="sections"
        activeFilterCount={hasActiveFilters ? 1 : 0}
        controls={
          <>
            <TableSearch
              icon={<Search className="h-4 w-4" />}
              placeholder="Search by section name, sort order, or field label..."
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
            />
            <Button
              variant="outline"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            {canManageSections ? (
              <Button variant="outline" onClick={onAddSection}>
                <FolderPlus className="h-4 w-4" />
                Add Section
              </Button>
            ) : null}
          </>
        }
      />

      <DataTableTanstack
        columns={columns}
        data={pagedRows}
        loading={loading}
        emptyMessage={
          hasActiveFilters
            ? "No sections match your current search."
            : "No sections defined yet. Add your first section to organize fields."
        }
        itemLabel="sections"
        chrome="flat"
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageCount={Math.max(1, Math.ceil(total / pageSize))}
        totalCount={total}
        manualPagination
        sorting={sorting}
        onSortingChange={onSortingChange}
      />
    </TableSurface>
  );
}
