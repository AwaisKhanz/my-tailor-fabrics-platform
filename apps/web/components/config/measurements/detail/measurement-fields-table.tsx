import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Edit2, RotateCcw, Search, Trash2 } from "lucide-react";
import {
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
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
import { useUrlTableState } from "@/hooks/use-url-table-state";

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

const PAGE_SIZE = 10;
const ALL_SECTIONS_FILTER = "all";

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
  const [movingFieldId, setMovingFieldId] = useState<string | null>(null);
  const { values, setValues, getPositiveInt } = useUrlTableState({
    prefix: "fields",
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
      section: ALL_SECTIONS_FILTER,
    },
  });

  const sectionOptions = useMemo(
    () =>
      [...(showArchived ? sections : sections.filter((section) => !section.deletedAt))].sort((left, right) => {
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }
        return left.name.localeCompare(right.name);
      }),
    [sections, showArchived],
  );
  const moveSectionOptions = useMemo(
    () => sectionOptions.filter((section) => !section.deletedAt),
    [sectionOptions],
  );

  const search = values.search ?? "";
  const sectionFilter = values.section ?? ALL_SECTIONS_FILTER;
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);

  const filteredFields = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const visibleFields = showArchived
      ? fields
      : fields.filter((field) => !field.deletedAt);

    return visibleFields.filter((field) => {
      if (
        sectionFilter !== ALL_SECTIONS_FILTER &&
        field.sectionId !== sectionFilter
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const sectionName = field.section?.name ?? "General";
      const haystack = [field.label, field.unit ?? "", sectionName]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [fields, search, sectionFilter, showArchived]);

  const total = filteredFields.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasActiveFilters =
    search.trim().length > 0 || sectionFilter !== ALL_SECTIONS_FILTER;
  const activeFilterCount =
    (search.trim().length > 0 ? 1 : 0) +
    (sectionFilter !== ALL_SECTIONS_FILTER ? 1 : 0);

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  const updateSearch = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const updateSectionFilter = useCallback(
    (value: string) => {
      setValues({
        section: value,
        page: "1",
      });
    },
    [setValues],
  );

  const resetFilters = useCallback(() => {
    setValues({
      search: "",
      section: ALL_SECTIONS_FILTER,
      page: "1",
    });
  }, [setValues]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, setPage, totalPages]);

  const pagedFields = useMemo(() => {
    const sortedFields = [...filteredFields].sort((a, b) => {
      const sectionOrderA = a.section?.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const sectionOrderB = b.section?.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (sectionOrderA !== sectionOrderB) {
        return sectionOrderA - sectionOrderB;
      }
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.label.localeCompare(b.label);
    });
    const start = (page - 1) * pageSize;
    return sortedFields.slice(start, start + pageSize);
  }, [filteredFields, page, pageSize]);

  const handleMoveFieldSection = useCallback(
    async (field: MeasurementField, sectionId: string) => {
      if (!onMoveFieldSection || sectionId === field.sectionId) {
        return;
      }

      setMovingFieldId(field.id);
      try {
        await onMoveFieldSection(field, sectionId);
      } finally {
        setMovingFieldId((current) => (current === field.id ? null : current));
      }
    },
    [onMoveFieldSection],
  );

  const columns = useMemo<ColumnDef<MeasurementField>[]>(
    () => [
      {
        header: "Field Label",
        cell: (field) => <span className="font-semibold text-text-primary">{field.label}</span>,
      },
      {
        header: "Section",
        cell: (field) => {
          const currentSectionId =
            field.sectionId ?? sectionOptions[0]?.id ?? "";
          const showSectionMoveSelect =
            canManageFields &&
            Boolean(onMoveFieldSection) &&
            moveSectionOptions.length > 0 &&
            !field.deletedAt &&
            Boolean(currentSectionId);

          if (!showSectionMoveSelect) {
            return (
              <Badge variant="secondary" size="xs">
                {field.section?.name ?? "General"}
              </Badge>
            );
          }

          return (
            <div className="min-w-[180px]">
              <Select
                value={currentSectionId}
                onValueChange={(nextSectionId) => {
                  void handleMoveFieldSection(field, nextSectionId);
                }}
                disabled={movingFieldId === field.id}
              >
                <SelectTrigger variant="table" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moveSectionOptions.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      },
      {
        header: "Data Type",
        cell: (field) => {
          let typeLabel = "Text";
          if (field.fieldType === "NUMBER") {
            typeLabel = field.unit?.trim()
              ? `Number (${field.unit.trim()})`
              : "Number";
          } else if (field.fieldType === "DROPDOWN") {
            typeLabel = "Dropdown";
          }

          return (
            <Badge variant="info" size="xs">
              {typeLabel}
            </Badge>
          );
        },
      },
      {
        header: "Status",
        cell: (field) => (
          <div className="flex items-center gap-2">
            {field.deletedAt ? (
              <Badge variant="outline" size="xs">
                Archived
              </Badge>
            ) : field.isRequired ? (
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <Label variant="dashboard" className="text-success">
                  Required
                </Label>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-text-secondary">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-muted" />
                <Label variant="dashboard">Optional</Label>
              </div>
            )}
          </div>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (field) => (
          <div className="flex items-center justify-end gap-1">
            {canManageFields ? (
              <>
                {field.deletedAt ? (
                  onRestoreField ? (
                    <Button
                      variant="tablePrimary"
                      size="sm"
                      onClick={() => onRestoreField(field)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  ) : null
                ) : (
                  <>
                    <Button
                      variant="tableIcon"
                      size="iconSm"
                      onClick={() => onEditField(field)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="tableDanger"
                      size="iconSm"
                      onClick={() => onDeleteField(field)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <span className="text-xs font-medium text-text-secondary">Read only</span>
            )}
          </div>
        ),
      },
    ],
    [
      canManageFields,
      handleMoveFieldSection,
      movingFieldId,
      moveSectionOptions,
      onDeleteField,
      onEditField,
      onMoveFieldSection,
      onRestoreField,
      sectionOptions,
    ],
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

            <Select value={sectionFilter} onValueChange={updateSectionFilter}>
              <SelectTrigger variant="table" className="md:w-[220px]">
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SECTIONS_FILTER}>All Sections</SelectItem>
                {sectionOptions.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
