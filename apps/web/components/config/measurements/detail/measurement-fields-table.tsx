import { useMemo } from "react";
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
import {
  ALL_MEASUREMENT_SECTIONS_FILTER_LABEL,
  useMeasurementFieldsTable,
} from "@/hooks/use-measurement-fields-table";

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
    sectionOptions,
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

  const columns = useMemo<ColumnDef<MeasurementField>[]>(
    () => [
      {
        header: "Field Label",
        cell: (field) => (
          <span className="font-semibold text-foreground">{field.label}</span>
        ),
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
              <Badge variant="default" size="xs">
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
                <SelectTrigger className="h-8 text-xs">
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
              <div className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <Label className="text-sm font-bold uppercase  text-muted-foreground text-primary">
                  Required
                </Label>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-muted" />
                <Label className="text-sm font-bold uppercase  text-muted-foreground">
                  Optional
                </Label>
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
                      variant="outline"
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
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditField(field)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDeleteField(field)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
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
