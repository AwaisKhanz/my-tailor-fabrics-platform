import { useMemo } from "react";
import { CheckCircle2, Edit2, Trash2 } from "lucide-react";
import { type MeasurementField } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { TableSurface, TableToolbar } from "@/components/ui/table-layout";

interface MeasurementFieldsTableProps {
  fields: MeasurementField[];
  loading: boolean;
  onEditField: (field: MeasurementField) => void;
  onDeleteField: (field: MeasurementField) => void;
  canManageFields?: boolean;
}

export function MeasurementFieldsTable({
  fields,
  loading,
  onEditField,
  onDeleteField,
  canManageFields = true,
}: MeasurementFieldsTableProps) {
  const columns = useMemo<ColumnDef<MeasurementField>[]>(
    () => [
      {
        header: "Field Label",
        cell: (field) => <span className="font-semibold text-text-primary">{field.label}</span>,
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
        data={fields}
        loading={loading}
        emptyMessage="No fields defined for this category."
        itemLabel="fields"
        chrome="flat"
      />
    </TableSurface>
  );
}
