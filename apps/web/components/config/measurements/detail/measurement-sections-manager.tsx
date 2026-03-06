import { useCallback, useEffect, useMemo } from "react";
import { FolderPlus, PencilLine, RotateCcw, Search, Trash2 } from "lucide-react";
import {
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import {
  TableSearch,
  TableSurface,
  TableToolbar,
} from "@/components/ui/table-layout";
import { useUrlTableState } from "@/hooks/use-url-table-state";

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

interface SectionRow {
  id: string;
  section: MeasurementSection;
  fieldCount: number;
  requiredCount: number;
}

const PAGE_SIZE = 8;

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
  const { values, setValues, getPositiveInt } = useUrlTableState({
    prefix: "sections",
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
    },
  });

  const search = values.search ?? "";
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);

  const rows = useMemo<SectionRow[]>(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const visibleSections = showArchived
      ? sections
      : sections.filter((section) => !section.deletedAt);
    const visibleFields = showArchived
      ? fields
      : fields.filter((field) => !field.deletedAt);

    const sortedSections = [...visibleSections].sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }
      return left.name.localeCompare(right.name);
    });

    return sortedSections
      .filter((section) => {
        if (!normalizedSearch) {
          return true;
        }

        const sectionFields = visibleFields.filter(
          (field) => field.sectionId === section.id,
        );
        const haystack = [
          section.name,
          String(section.sortOrder),
          ...sectionFields.map((field) => field.label),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .map((section) => {
        const sectionFields = visibleFields.filter(
          (field) => field.sectionId === section.id,
        );
        const requiredCount = sectionFields.filter((field) => field.isRequired).length;

        return {
          id: section.id,
          section,
          fieldCount: sectionFields.length,
          requiredCount,
        };
      });
  }, [fields, search, sections, showArchived]);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasActiveFilters = search.trim().length > 0;

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const updateSearch = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const resetFilters = useCallback(() => {
    setValues({
      search: "",
      page: "1",
    });
  }, [setValues]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, setPage, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [page, pageSize, rows]);

  const columns = useMemo<ColumnDef<SectionRow>[]>(
    () => [
      {
        header: "Section",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Badge variant="outline" size="xs">
              #{row.section.sortOrder + 1}
            </Badge>
            <span className="font-semibold text-text-primary">{row.section.name}</span>
          </div>
        ),
      },
      {
        header: "Fields",
        cell: (row) => (
          <Badge variant="secondary" size="xs">
            {row.fieldCount} field{row.fieldCount === 1 ? "" : "s"}
          </Badge>
        ),
      },
      {
        header: "Required",
        cell: (row) => (
          <Badge variant="success" size="xs">
            {row.requiredCount} required
          </Badge>
        ),
      },
      {
        header: "Sort",
        cell: (row) => (
          <Label variant="micro" className="text-text-secondary">
            {row.section.sortOrder}
          </Label>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (row) => (
          <div className="flex items-center justify-end gap-1.5">
            {canManageSections ? (
              <>
                {row.section.deletedAt ? (
                  onRestoreSection ? (
                    <Button
                      variant="tablePrimary"
                      size="sm"
                      onClick={() => onRestoreSection(row.section)}
                      aria-label={`Restore section ${row.section.name}`}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  ) : null
                ) : (
                  <>
                    <Button
                      variant="tablePrimary"
                      size="sm"
                      onClick={() => onAddFieldToSection(row.section.id)}
                    >
                      <FolderPlus className="h-4 w-4" />
                      Add Field
                    </Button>
                    <Button
                      variant="tableIcon"
                      size="iconSm"
                      onClick={() => onEditSection(row.section)}
                      aria-label={`Edit section ${row.section.name}`}
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="tableDanger"
                      size="iconSm"
                      onClick={() => onDeleteSection(row.section)}
                      aria-label={`Delete section ${row.section.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {row.section.deletedAt ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    aria-label={`Section ${row.section.name} is archived`}
                  >
                    Archived
                  </Button>
                ) : null}
              </>
            ) : (
              <span className="text-xs font-medium text-text-secondary">Read only</span>
            )}
          </div>
        ),
      },
    ],
    [
      canManageSections,
      onAddFieldToSection,
      onDeleteSection,
      onEditSection,
      onRestoreSection,
    ],
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
              variant="tableReset"
              size="sm"
              className="md:ml-auto"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>

            {canManageSections ? (
              <Button variant="tablePrimary" size="sm" onClick={onAddSection}>
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
