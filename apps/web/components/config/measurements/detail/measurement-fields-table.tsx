import { useCallback, useEffect, useMemo } from "react";
import { CheckCircle2, Edit2, Trash2 } from "lucide-react";
import { type MeasurementField } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { TableSurface, TableToolbar } from "@/components/ui/table-layout";
import { useUrlTableState } from "@/hooks/use-url-table-state";

interface MeasurementFieldsTableProps {
  fields: MeasurementField[];
  loading: boolean;
  onEditField: (field: MeasurementField) => void;
  onDeleteField: (field: MeasurementField) => void;
  canManageFields?: boolean;
}

const PAGE_SIZE = 10;

export function MeasurementFieldsTable({
  fields,
  loading,
  onEditField,
  onDeleteField,
  canManageFields = true,
}: MeasurementFieldsTableProps) {
  const { setValues, getPositiveInt } = useUrlTableState({
    prefix: "fields",
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
    },
  });

  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const total = fields.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, setPage, totalPages]);

  const pagedFields = useMemo(() => {
    const sortedFields = [...fields].sort((a, b) => {
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
  }, [fields, page, pageSize]);

  const columns = useMemo<ColumnDef<MeasurementField>[]>(
    () => [
      {
        header: "Field Label",
        cell: (field) => <span className="font-semibold text-text-primary">{field.label}</span>,
      },
      {
        header: "Section",
        cell: (field) => (
          <Badge variant="secondary" size="xs">
            {field.section?.name ?? "General"}
          </Badge>
        ),
      },
      {
        header: "Data Type",
        cell: (field) => (
          <Badge variant="info" size="xs">
            {field.fieldType === "NUMBER" ? "Numeric (Inches)" : field.fieldType}
          </Badge>
        ),
      },
      {
        header: "Status",
        cell: (field) => (
          <div className="flex items-center gap-2">
            {field.isRequired ? (
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
            ) : (
              <span className="text-xs font-medium text-text-secondary">Read only</span>
            )}
          </div>
        ),
      },
    ],
    [canManageFields, onDeleteField, onEditField],
  );

  return (
    <TableSurface>
      <TableToolbar title="Measurement Fields" total={fields.length} totalLabel="fields" />
      <DataTable
        columns={columns}
        data={pagedFields}
        loading={loading}
        emptyMessage="No fields defined for this category."
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
