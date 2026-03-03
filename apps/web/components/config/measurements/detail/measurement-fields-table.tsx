import { useMemo } from "react";
import { CheckCircle2, Edit2, Trash2 } from "lucide-react";
import { type MeasurementField } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";

interface MeasurementFieldsTableProps {
  fields: MeasurementField[];
  loading: boolean;
  onEditField: (field: MeasurementField) => void;
  onDeleteField: (field: MeasurementField) => void;
}

export function MeasurementFieldsTable({
  fields,
  loading,
  onEditField,
  onDeleteField,
}: MeasurementFieldsTableProps) {
  const columns = useMemo<ColumnDef<MeasurementField>[]>(
    () => [
      {
        header: "Field Label",
        cell: (field) => <span className="font-semibold text-foreground">{field.label}</span>,
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
              <div className="flex items-center gap-1.5 text-muted-foreground">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onEditField(field)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDeleteField(field)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onDeleteField, onEditField],
  );

  return (
    <DataTable
      columns={columns}
      data={fields}
      loading={loading}
      emptyMessage="No fields defined for this category."
      itemLabel="fields"
    />
  );
}
