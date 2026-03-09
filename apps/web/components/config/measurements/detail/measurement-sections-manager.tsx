import { FolderPlus, RotateCcw, Search } from "lucide-react";
import {
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  TableSearch,
  TableSurface,
  TableToolbar,
} from "@/components/ui/table-layout";
import { useMeasurementSectionsManager } from "@/hooks/use-measurement-sections-manager";

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
              variant="ghost"
              size="sm"
              className="md:ml-auto"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>

            {canManageSections ? (
              <Button variant="outline" size="sm" onClick={onAddSection}>
                <FolderPlus className="h-4 w-4" />
                Add Section
              </Button>
            ) : null}
          </>
        }
      />

      <DataTable
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
        page={page}
        total={total}
        limit={pageSize}
        onPageChange={setPage}
      />
    </TableSurface>
  );
}
