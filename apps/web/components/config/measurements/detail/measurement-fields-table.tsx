import { useCallback, useMemo } from "react";
import {
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { RotateCcw, Search } from "lucide-react";
import {
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import {
  TableSearch,
  TableSurface,
  TableToolbar,
} from "@tbms/ui/components/table-layout";
import {
  ALL_MEASUREMENT_SECTIONS_FILTER,
  ALL_MEASUREMENT_SECTIONS_FILTER_LABEL,
  useMeasurementFieldsTable,
} from "@/hooks/use-measurement-fields-table";
import { useMeasurementFieldTableColumns } from "@/components/config/measurements/detail/measurement-field-table-columns";
import { resolveUpdater } from "@/lib/tanstack";

interface MeasurementFieldsTableProps {
  fields: MeasurementField[];
  sections: MeasurementSection[];
  loading: boolean;
  showArchived?: boolean;
  onEditField: (field: MeasurementField) => void;
  onDeleteField: (field: MeasurementField) => void;
  onRestoreField?: (field: MeasurementField) => void;
  onMoveFieldSection?: (
    field: MeasurementField,
    sectionId: string,
  ) => Promise<void> | void;
  canManageFields?: boolean;
}

export function MeasurementFieldsTable({
  fields,
  sections,
  loading,
  showArchived = false,
  onEditField,
  onDeleteField,
  onRestoreField,
  onMoveFieldSection,
  canManageFields = true,
}: MeasurementFieldsTableProps) {
  const {
    movingFieldId,
    moveSectionOptions,
    sectionFilterOptions,
    search,
    sectionFilter,
    page,
    pageSize,
    pagedFields,
    total,
    hasActiveFilters,
    activeFilterCount,
    updateSearch,
    updateSectionFilter,
    resetFilters,
    setPage,
    handleMoveFieldSection,
  } = useMeasurementFieldsTable({
    fields,
    sections,
    showArchived,
    onMoveFieldSection,
  });

  const columns = useMeasurementFieldTableColumns({
    canManageFields,
    movingFieldId,
    moveSectionOptions,
    onDeleteField,
    onEditField,
    onMoveFieldSection,
    onRestoreField,
    handleMoveFieldSection,
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
        title="Measurement Fields"
        total={total}
        totalLabel="fields"
        activeFilterCount={activeFilterCount}
        controls={
          <>
            <TableSearch
              icon={<Search className="h-4 w-4" />}
              placeholder="Search by label, section, or unit..."
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
            />

            <Select
              value={sectionFilter}
              onValueChange={(value) =>
                updateSectionFilter(value ?? ALL_MEASUREMENT_SECTIONS_FILTER)
              }
            >
              <SelectTrigger className="md:w-[220px]">
                <SelectValue
                  placeholder={ALL_MEASUREMENT_SECTIONS_FILTER_LABEL}
                />
              </SelectTrigger>
              <SelectContent>
                {sectionFilterOptions.map((section) => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </>
        }
      />
      <DataTableTanstack
        columns={columns}
        data={pagedFields}
        loading={loading}
        emptyMessage={
          hasActiveFilters
            ? "No fields match the current filters."
            : "No fields defined for this category."
        }
        itemLabel="fields"
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
