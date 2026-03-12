"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  FolderPlus,
  PencilLine,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { Label } from "@tbms/ui/components/label";
import { useUrlTableState } from "@/hooks/use-url-table-state";

interface UseMeasurementSectionsManagerParams {
  sections: MeasurementSection[];
  fields: MeasurementField[];
  showArchived?: boolean;
  canManageSections?: boolean;
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

export function useMeasurementSectionsManager({
  sections,
  fields,
  showArchived = false,
  canManageSections = true,
  onEditSection,
  onDeleteSection,
  onRestoreSection,
  onAddFieldToSection,
}: UseMeasurementSectionsManagerParams) {
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
        const requiredCount = sectionFields.filter(
          (field) => field.isRequired,
        ).length;

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
        id: "section",
        header: "Section",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              #{row.original.section.sortOrder + 1}
            </Badge>
            <span className="font-semibold text-foreground">
              {row.original.section.name}
            </span>
          </div>
        ),
      },
      {
        id: "fields",
        header: "Fields",
        cell: ({ row }) => (
          <Badge variant="default">
            {row.original.fieldCount} field{row.original.fieldCount === 1 ? "" : "s"}
          </Badge>
        ),
      },
      {
        id: "required",
        header: "Required",
        cell: ({ row }) => (
          <Badge variant="default">
            {row.original.requiredCount} required
          </Badge>
        ),
      },
      {
        id: "sort",
        header: "Sort",
        cell: ({ row }) => (
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            {row.original.section.sortOrder}
          </Label>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            {canManageSections ? (
              <>
                {row.original.section.deletedAt ? (
                  onRestoreSection ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestoreSection(row.original.section)}
                      aria-label={`Restore section ${row.original.section.name}`}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  ) : null
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddFieldToSection(row.original.section.id)}
                    >
                      <FolderPlus className="h-4 w-4" />
                      Add Field
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditSection(row.original.section)}
                      aria-label={`Edit section ${row.original.section.name}`}
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDeleteSection(row.original.section)}
                      aria-label={`Delete section ${row.original.section.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {row.original.section.deletedAt ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    aria-label={`Section ${row.original.section.name} is archived`}
                  >
                    Archived
                  </Button>
                ) : null}
              </>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                Read only
              </span>
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

  return {
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
  };
}
