import { RotateCcw, Search } from "lucide-react";
import {
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableSearch,
  TableSurface,
  TableToolbar,
} from "@/components/ui/table-layout";
import {
  ALL_MEASUREMENT_SECTIONS_FILTER_LABEL,
  useMeasurementFieldsTable,
} from "@/hooks/use-measurement-fields-table";
import { useMeasurementFieldTableColumns } from "@/components/config/measurements/detail/measurement-field-table-columns";

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

            <Select value={sectionFilter} onValueChange={updateSectionFilter}>
              <SelectTrigger className="md:w-[220px]">
                <SelectValue placeholder={ALL_MEASUREMENT_SECTIONS_FILTER_LABEL} />
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
              variant="ghost"
              size="sm"
              className="md:ml-auto"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </>
        }
      />
      <DataTable
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
        page={page}
        total={total}
        limit={pageSize}
        onPageChange={setPage}
      />
    </TableSurface>
  );
}
