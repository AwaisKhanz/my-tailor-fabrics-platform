import { useMemo } from "react";
import { CheckCircle2, Edit2, RotateCcw, Trash2 } from "lucide-react";
import {
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { FieldLabel } from "@tbms/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";

interface UseMeasurementFieldTableColumnsParams {
  canManageFields: boolean;
  movingFieldId: string | null;
  moveSectionOptions: MeasurementSection[];
  onDeleteField: (field: MeasurementField) => void;
  onEditField: (field: MeasurementField) => void;
  onMoveFieldSection?: (
    field: MeasurementField,
    sectionId: string,
  ) => Promise<void> | void;
  onRestoreField?: (field: MeasurementField) => void;
  handleMoveFieldSection: (
    field: MeasurementField,
    sectionId: string,
  ) => Promise<void>;
}

export function useMeasurementFieldTableColumns({
  canManageFields,
  movingFieldId,
  moveSectionOptions,
  onDeleteField,
  onEditField,
  onMoveFieldSection,
  onRestoreField,
  handleMoveFieldSection,
}: UseMeasurementFieldTableColumnsParams) {
  return useMemo<ColumnDef<MeasurementField>[]>(
    () => [
      {
        id: "label",
        header: "Field Label",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.label}
          </span>
        ),
      },
      {
        id: "section",
        header: "Section",
        cell: ({ row }) => {
          const currentSectionId =
            row.original.sectionId ?? moveSectionOptions[0]?.id ?? "";
          const showSectionMoveSelect =
            canManageFields &&
            Boolean(onMoveFieldSection) &&
            moveSectionOptions.length > 0 &&
            !row.original.deletedAt &&
            Boolean(currentSectionId);

          if (!showSectionMoveSelect) {
            return (
              <Badge variant="default">
                {row.original.section?.name ?? "General"}
              </Badge>
            );
          }

          return (
            <div className="min-w-[180px]">
              <Select
                value={currentSectionId}
                onValueChange={(nextSectionId) => {
                  if (!nextSectionId) {
                    return;
                  }
                  void handleMoveFieldSection(row.original, nextSectionId);
                }}
                disabled={movingFieldId === row.original.id}
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
        id: "dataType",
        header: "Data Type",
        cell: ({ row }) => {
          let typeLabel = "Text";
          if (row.original.fieldType === "NUMBER") {
            typeLabel = row.original.unit?.trim()
              ? `Number (${row.original.unit.trim()})`
              : "Number";
          } else if (row.original.fieldType === "DROPDOWN") {
            typeLabel = "Dropdown";
          }

          return (
            <Badge variant="secondary">
              {typeLabel}
            </Badge>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.deletedAt ? (
              <Badge variant="outline">
                Archived
              </Badge>
            ) : row.original.isRequired ? (
              <div className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <FieldLabel tone="primary">Required</FieldLabel>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-muted" />
                <FieldLabel>Optional</FieldLabel>
              </div>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {canManageFields ? (
              <>
                {row.original.deletedAt ? (
                  onRestoreField ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestoreField(row.original)}
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
                      onClick={() => onEditField(row.original)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDeleteField(row.original)}
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
      moveSectionOptions,
      movingFieldId,
      onDeleteField,
      onEditField,
      onMoveFieldSection,
      onRestoreField,
    ],
  );
}
